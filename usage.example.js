const { updateDomainContent, listAllDomains, getDomainContent } = require('./domainContentManager');

async function main() {
    console.log('🚀 Domain Content Manager - Usage Example\n');

    // Example 1: Add content for multiple domains
    const domains = [
        {
            name: 'ecommerce-site.com',
            content: `
E-commerce Website Content
=========================

Products:
- Electronics
- Clothing  
- Books

Features:
- Shopping cart
- Payment gateway
- User reviews

Last updated: ${new Date().toISOString()}
            `
        },
        {
            name: 'blog.example.org',
            content: `
Personal Blog Content
====================

Recent Posts:
- "Getting Started with Node.js"
- "Git Best Practices"
- "Web Development Tips"

Author: John Doe
Contact: john@example.org

Last updated: ${new Date().toISOString()}
            `
        },
        {
            name: 'api.service.net',
            content: `
API Service Documentation
========================

Endpoints:
- GET /users
- POST /users
- PUT /users/:id
- DELETE /users/:id

Authentication: Bearer Token
Rate Limit: 1000 requests/hour

Last updated: ${new Date().toISOString()}
            `
        }
    ];

    // Create content for all domains
    console.log('📝 Creating content for domains...');
    for (const domain of domains) {
        const result = await updateDomainContent(domain.name, domain.content);
        if (result.success) {
            console.log(`✅ ${domain.name} → ${result.filePath}`);
        } else {
            console.error(`❌ Failed to create ${domain.name}: ${result.error}`);
        }
    }

    // List all domains
    console.log('\n📋 All domains with content:');
    const allDomains = await listAllDomains();
    allDomains.forEach((domain, index) => {
        console.log(`   ${index + 1}. ${domain}`);
    });

    // Update existing domain
    console.log('\n🔄 Updating existing domain...');
    const updateResult = await updateDomainContent('ecommerce-site.com', `
E-commerce Website Content - UPDATED
====================================

NEW Products:
- Electronics (50% off!)
- Clothing (New arrivals)
- Books (Bestsellers)
- Home & Garden (NEW CATEGORY!)

Enhanced Features:
- Shopping cart with wishlist
- Multiple payment gateways
- User reviews and ratings
- AI-powered recommendations

Last updated: ${new Date().toISOString()}
    `);

    if (updateResult.success) {
        console.log('✅ Successfully updated ecommerce-site.com');
    }

    // Read and display current content
    console.log('\n📖 Current content for ecommerce-site.com:');
    const currentContent = await getDomainContent('ecommerce-site.com');
    if (currentContent) {
        console.log(currentContent);
    }

    console.log('\n✨ Usage example completed!');
}

main().catch(console.error);
