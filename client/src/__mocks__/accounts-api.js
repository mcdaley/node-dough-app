//-----------------------------------------------------------------------------
// client/src/pages/accounts/__tests__/__mocks__/accounts-api.js
//-----------------------------------------------------------------------------
export default {
  get:    jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({})
};