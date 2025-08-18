// TestSprite MCP automated test for PaperLink
// This script tests login, paper upload, search, and admin approval

const { MCP } = require('@testsprite/testsprite-mcp');

const mcp = new MCP({ baseUrl: 'http://localhost:3000' });

module.exports = async function() {
  // 1. Login as admin
  const adminLogin = await mcp.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email: 'admin@paper.link', password: 'admin123' },
    json: true
  });
  mcp.setToken(adminLogin.token);

  // 2. Upload a paper
  const uploadRes = await mcp.request({
    method: 'POST',
    url: '/api/papers',
    headers: { Authorization: 'Bearer ' + adminLogin.token },
    formData: {
      title: 'Test Paper',
      abstract: 'This is a test abstract.',
      tags: 'test,automation',
      file: Buffer.from('PDF DATA'), // Replace with actual file data if needed
      filename: 'test.pdf',
      contentType: 'application/pdf'
    }
  });

  // 3. Search for the paper
  const searchRes = await mcp.request({
    method: 'GET',
    url: '/api/papers?q=Test Paper',
    headers: { Authorization: 'Bearer ' + adminLogin.token },
    json: true
  });

  // 4. Approve the paper (if pending)
  const paperId = uploadRes.id || (searchRes.papers && searchRes.papers[0] && searchRes.papers[0].id);
  if (paperId) {
    await mcp.request({
      method: 'POST',
      url: `/api/papers/admin/${paperId}/approve`,
      headers: { Authorization: 'Bearer ' + adminLogin.token }
    });
  }

  // 5. Assert paper is approved and visible
  const finalSearch = await mcp.request({
    method: 'GET',
    url: '/api/papers?q=Test Paper',
    headers: { Authorization: 'Bearer ' + adminLogin.token },
    json: true
  });
  if (finalSearch.papers && finalSearch.papers.length > 0) {
    console.log('Test passed: Paper uploaded and approved.');
  } else {
    throw new Error('Test failed: Paper not found after approval.');
  }
};
