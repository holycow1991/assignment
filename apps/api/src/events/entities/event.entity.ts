import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { randomUUID } from "node:crypto";

@Entity("events")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  externalId!: string;

  @Column()
  sourceEventId!: string;

  @Column()
  disciplineName!: string;

  @Column()
  disciplineCode!: string;

  @Column()
  eventUnitName!: string;

  @Column()
  eventName!: string;

  @Column()
  phaseName!: string;

  @Column()
  genderCode!: string;

  @Column()
  olympicDay!: string;

  @Column({ type: "timestamptz" })
  startDate!: string;

  @Column({ type: "timestamptz" })
  endDate!: string;

  @Column()
  venue!: string;

  @Column()
  venueDescription!: string;

  @Column()
  location!: string;

  @Column()
  locationDescription!: string;

  @Column()
  status!: string;

  @Column()
  statusDescription!: string;

  @Column()
  scheduleItemType!: string;

  @Column({ type: "jsonb" })
  competitors!: { name: string }[];

  @BeforeInsert()
  generateExternalId() {
    this.externalId = randomUUID();
  }
}
