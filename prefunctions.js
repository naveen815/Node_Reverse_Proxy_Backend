const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DOMAINS_FOLDER = 'ConfigBackup'; // You can change this folder name

async function updateDomainContent(domainName, fileContent) {
    try {
        // Validate inputs
        if (!domainName || typeof domainName !== 'string') {
            throw new Error('Domain name is required and must be a string');
        }
        if (!fileContent || typeof fileContent !== 'string') {
            throw new Error('File content is required and must be a string');
        }

        // Create domains folder if it doesn't exist
        const domainsPath = path.join(process.cwd(), DOMAINS_FOLDER);
        try {
            await fs.access(domainsPath);
        } catch (error) {
            await fs.mkdir(domainsPath, { recursive: true });
            console.log(`📁 Created domains folder: ${DOMAINS_FOLDER}`);
        }

        // Sanitize domain name for filename
        const sanitizedDomain = domainName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${sanitizedDomain}.conf`;
        const filePath = path.join(domainsPath, fileName);
        const relativeFilePath = path.join(DOMAINS_FOLDER, fileName);
        
        // Check if git repository exists
        try {
            execSync('git status', { stdio: 'ignore' });
        } catch (error) {
            throw new Error('Not a git repository. Please initialize git first with "git init"');
        }

        // Check if file exists and read old content
        let oldContent = null;
        let fileExists = false;
        
        try {
            oldContent = await fs.readFile(filePath, 'utf-8');
            fileExists = true;
            console.log(`✅ Found existing content for domain: ${domainName}`);
            console.log(`📝 File location: ${relativeFilePath}`);
            console.log(`📝 Old content preview: ${oldContent.substring(0, 100)}...`);
        } catch (error) {
            console.log(`🆕 No existing file found for domain: ${domainName}`);
            console.log(`📝 Will create: ${relativeFilePath}`);
        }

        // Write new content to file
        await fs.writeFile(filePath, fileContent, 'utf-8');
        console.log(`✏️ Updated content for domain: ${domainName}`);

        // Git operations
        try {
            // Stage the file (use relative path for git)
            execSync(`git add "${relativeFilePath}"`, { stdio: 'inherit' });
            console.log(`📁 Staged file: ${relativeFilePath}`);
            
            // Create commit message
            const commitMessage = fileExists 
                ? `Update content for domain: ${domainName}`
                : `Add new content for domain: ${domainName}`;
            
            // Commit the changes
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
            console.log(`💾 Committed changes with message: "${commitMessage}"`);
            
            // Push to remote (if remote exists)
            try {
                execSync('git push', { stdio: 'inherit' });
                console.log(`🚀 Successfully pushed to remote repository`);
            } catch (pushError) {
                console.log(`⚠️ Could not push to remote (this is OK if no remote is configured)`);
            }
            
        } catch (gitError) {
            throw new Error(`Git operation failed: ${gitError.message}`);
        }

        return {
            success: true,
            domain: domainName,
            fileName: fileName,
            filePath: relativeFilePath,
            fileExists: fileExists,
            oldContent: oldContent,
            message: fileExists ? 'Content updated successfully' : 'New content created successfully'
        };

    } catch (error) {
        console.error('❌ Error updating domain content:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Helper function to get old content from git history
async function getOldContentFromGit(domainName, commitHash = 'HEAD~1') {
    try {
        const sanitizedDomain = domainName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${sanitizedDomain}.conf`;
        const relativeFilePath = path.join(DOMAINS_FOLDER, fileName);
        
        const oldContent = execSync(`git show ${commitHash}:${relativeFilePath}`, { encoding: 'utf-8' });
        return oldContent;
    } catch (error) {
        console.log('Could not retrieve old content from git history');
        return null;
    }
}

// Helper function to list all domain files
async function listAllDomains() {
    try {
        const domainsPath = path.join(process.cwd(), DOMAINS_FOLDER);
        const files = await fs.readdir(domainsPath);
        
        const domains = files
            .filter(file => file.endsWith('.conf'))
            .map(file => file.replace('.conf', '').replace(/_/g, '.'))
            .sort();
            
        return domains;
    } catch (error) {
        console.log('No domains folder found or error reading domains');
        return [];
    }
}

// Helper function to read domain content
async function getDomainContent(domainName) {
    try {
        const sanitizedDomain = domainName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${sanitizedDomain}.conf`;
        const filePath = path.join(process.cwd(), DOMAINS_FOLDER, fileName);
        
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        return null;
    }
}

module.exports = {
    updateDomainContent,
    getOldContentFromGit,
    listAllDomains,
    getDomainContent,
    DOMAINS_FOLDER
};
