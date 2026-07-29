import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'AgentLab API Reference',
    description: 'Auto-generated API schema for Mintlify docs.',
    version: '1.0.0'
  },
  host: 'localhost:3000' // Change to your local port if different
};

const outputFile = './openapi.json';
const routesEndpointsFiles = ['./routers.ts', './index.ts'];

// Execute the generator
swaggerAutogen()(outputFile, routesEndpointsFiles, doc);
