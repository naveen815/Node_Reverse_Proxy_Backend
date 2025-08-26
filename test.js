const { updateDomainContent, getOldContentFromGit, listAllDomains, getDomainContent } = require('./domainContentManager');

async function runTest() {
    console.log('🧪 Starting domain content management test with separate folders...\n');

    try {
        // Test 1: Create new content for a domain
        console.log('=== Test 1: Creating new content ===');
        let result = await updateDomainContent('example.com', 'This is the initial content for example.com website.');
        
        if (result.success) {
            console.log('✅', result.message);
            console.log('📍 File stored at:', result.filePath);
        } else {
            console.error('❌', result.error);
            return;
        }

        // Wait a moment
        console.log('\n⏳ Waiting 2 seconds before next test...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 2: Update existing content for the same domain
        console.log('=== Test 2: Updating existing content ===');
        result = await updateDomainContent('example.com', 'This is the UPDATED content for example.com website. The old content is now in git history!');
        
        if (result.success) {
            console.log('✅', result.message);
            console.log('📍 File updated at:', result.filePath);
            
            // Retrieve old content from git history
            console.log('\n=== Retrieving old content from git history ===');
            const oldContent = await getOldContentFromGit('example.com');
            if (oldContent) {
                console.log('📜 Previous content from git:', oldContent.substring(0, 100) + '...');
            }
        } else {
            console.error('❌', result.error);
        }

        // Test 3: Create content for multiple domains
        console.log('\n=== Test 3: Creating content for multiple domains ===');
        const domains = ['test-site.org', 'my-blog.net', 'company-website.com'];
        
        for (const domain of domains) {
            result = await updateDomainContent(domain, `Content for ${domain} domain. Created at ${new Date().toISOString()}`);
            if (result.success) {
                console.log(`✅ Created content for ${domain} at ${result.filePath}`);
            }
        }

        // Test 4: List all domains
        console.log('\n=== Test 4: Listing all domains ===');
        const allDomains = await listAllDomains();
        console.log('📋 All domains with content:');
        allDomains.forEach(domain => console.log(`   - ${domain}`));

        // Test 5: Read specific domain content
        console.log('\n=== Test 5: Reading domain content ===');
        const content = await getDomainContent('example.com');
        if (content) {
            console.log('📖 Current content for example.com:');
            console.log(content.substring(0, 200) + '...');
        }

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
runTest();
