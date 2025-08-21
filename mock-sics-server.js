const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mock flow endpoints
app.post('/api/flow/test-action', (req, res) => {
  const { action, parameters, team, version, requestId } = req.body;

  console.log('SICS Test Action called:', {
    action,
    parameters,
    team,
    version,
    requestId,
  });

  res.json({
    success: true,
    result: {
      processed: true,
      input: parameters,
      timestamp: new Date().toISOString(),
      message: `Successfully processed "${parameters.message || 'default'}" for team ${team}`,
      actionId: action,
      version: version,
    },
    requestId,
  });
});

app.post('/api/flow/data-transform', (req, res) => {
  const { parameters, requestId } = req.body;

  console.log('Data Transform called:', parameters);

  // Simple transformation - add processed flag and timestamp
  const transformedData = {
    ...parameters.input,
    _processed: true,
    _timestamp: new Date().toISOString(),
    _transformRules: parameters.transformRules,
  };

  res.json({
    success: true,
    result: {
      originalData: parameters.input,
      transformedData: transformedData,
      rulesApplied: parameters.transformRules,
    },
    requestId,
  });
});

app.post('/api/flow/data-validate', (req, res) => {
  const { parameters, requestId } = req.body;

  console.log('Data Validate called:', parameters);

  // Simple validation - check if required fields exist
  const data = parameters.data;
  const schema = parameters.schema;

  let isValid = true;
  const errors = [];

  if (schema.required) {
    schema.required.forEach(field => {
      if (!data[field]) {
        isValid = false;
        errors.push(`Missing required field: ${field}`);
      }
    });
  }

  res.json({
    success: true,
    result: {
      valid: isValid,
      errors: errors,
      data: data,
      schema: schema,
    },
    requestId,
  });
});

app.post('/api/flow/send-notification', (req, res) => {
  const { parameters, requestId } = req.body;

  console.log('Send Notification called:', parameters);

  res.json({
    success: true,
    result: {
      message: parameters.message,
      channels: parameters.channels,
      priority: parameters.priority || 'normal',
      sent: true,
      sentAt: new Date().toISOString(),
      notificationId: `notif_${Date.now()}`,
    },
    requestId,
  });
});

// Error simulation endpoint
app.post('/api/flow/error-test', (req, res) => {
  console.log('Error test endpoint called');
  res.status(500).json({
    success: false,
    error: {
      code: 'TEST_ERROR',
      message: 'Simulated server error for testing',
      details: 'This is a mock error for testing error handling',
    },
  });
});

// Timeout simulation endpoint
app.post('/api/flow/timeout-test', (req, res) => {
  console.log('Timeout test endpoint called - will delay response');
  setTimeout(() => {
    res.json({
      success: true,
      result: {
        message: 'Response after delay',
        delayed: true,
      },
    });
  }, 35000); // 35 seconds - longer than default timeout
});

// Catch all for unknown endpoints
app.all('*', (req, res) => {
  console.log(`Unknown endpoint called: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
      availableEndpoints: [
        'GET /api/health',
        'POST /api/flow/test-action',
        'POST /api/flow/data-transform',
        'POST /api/flow/data-validate',
        'POST /api/flow/send-notification',
        'POST /api/flow/error-test',
        'POST /api/flow/timeout-test',
      ],
    },
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Mock SICS Flow Adapter Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Available endpoints:`);
  console.log(`   - POST /api/flow/test-action`);
  console.log(`   - POST /api/flow/data-transform`);
  console.log(`   - POST /api/flow/data-validate`);
  console.log(`   - POST /api/flow/send-notification`);
  console.log(`   - POST /api/flow/error-test`);
  console.log(`   - POST /api/flow/timeout-test`);
});
