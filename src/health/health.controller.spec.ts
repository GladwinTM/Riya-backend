import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns an OK status', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    const response = module.get(HealthController).check();
    expect(response.status).toBe('ok');
    expect(response.timestamp).toEqual(expect.any(String));
  });
});
