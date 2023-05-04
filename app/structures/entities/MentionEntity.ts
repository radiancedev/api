import { Entity, EntityData } from "../Entity";

export interface MentionEntityData extends EntityData {
    name: string;
    display_name?: string | null;
}

export interface MentionEntity extends Entity<MentionEntityData> {
    
}