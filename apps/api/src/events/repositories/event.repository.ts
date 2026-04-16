import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEntity } from "../entities/event.entity";

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  async upsert(entities: EventEntity[]): Promise<void> {
    await this.repo.upsert(entities, ["id"]);
  }

  findAll(): Promise<EventEntity[]> {
    return this.repo.find({ order: { startDate: "ASC" } });
  }

  findByExternalId(externalId: string): Promise<EventEntity | null> {
    return this.repo.findOneBy({ externalId });
  }
}
