const { Client } = require('ssh2');
const fs = require('fs').promises;
const path = require('path');

/**
 * Uploads a config file to a remote server using SSH (password auth).
 * @param {string} domainName - The domain name (used to find the config file).
 * @param {string} username - SSH username for the target server.
 * @param {string} password - SSH password for the target server.
 * @param {string} host - Target server IP or hostname.
 * @param {string} remotePath - Full path on the remote server to write the config file.
 * @param {string} [localConfigDir='ConfigBackup'] - Local directory where config files are stored.
 */
async function uploadConfigViaSSH(domainName, username, password, host, remotePath, localConfigDir = 'ConfigBackup') {
    const conn = new Client();
    const sanitizedDomain = domainName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${sanitizedDomain}.conf`;
    const localFilePath = path.join(process.cwd(), localConfigDir, fileName);

    let fileContent;
    try {
        fileContent = await fs.readFile(localFilePath, 'utf-8');
    } catch (err) {
        console.error(`Could not read local config file: ${localFilePath}`);
        throw err;
    }

    return new Promise((resolve, reject) => {
        conn.on('ready', () => {
            console.log('SSH Connection ready');
            conn.sftp((err, sftp) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                // Write file to remote
                const writeStream = sftp.createWriteStream(remotePath);
                writeStream.on('close', () => {
                    console.log(`File uploaded to ${host}:${remotePath}`);
                    conn.end();
                    resolve(true);
                });
                writeStream.on('error', (err) => {
                    console.error('SFTP write error:', err);
                    conn.end();
                    reject(err);
                });
                writeStream.end(fileContent);
            });
        }).on('error', (err) => {
            console.error('SSH connection error:', err);
            reject(err);
        }).connect({
            host,
            port: 22,
            username,
            password
        });
    });
}

// Example usage:
// uploadConfigViaSSH('example.com', 'user', 'pass', '1.2.3.4', '/etc/nginx/conf.d/example.com.conf')
//   .then(() => console.log('Upload complete'))
//   .catch(console.error);

module.exports = { uploadConfigViaSSH };
