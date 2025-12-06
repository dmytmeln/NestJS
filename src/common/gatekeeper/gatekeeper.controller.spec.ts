import { Test, TestingModule } from '@nestjs/testing';
import { GatekeeperController } from './gatekeeper.controller';

describe('GatekeeperController', () => {
  let controller: GatekeeperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatekeeperController],
    }).compile();

    controller = module.get<GatekeeperController>(GatekeeperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
