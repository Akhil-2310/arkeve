import { publicClient, getArkivWalletClient } from './arkiv';
import type { Entity, Attribute } from '@arkiv-network/sdk';
import { jsonToPayload, ExpirationTime } from '@arkiv-network/sdk/utils';
import { eq } from '@arkiv-network/sdk/query';
import type { Hex } from 'viem';
import type { Connector } from 'wagmi';

// ========================
// TYPE DEFINITIONS
// ========================

export interface OrganizerData {
    name: string;
    bio: string;
    avatar?: string;
    twitter?: string;
}

export interface EventData {
    title: string;
    description: string;
    date: string;         // ISO date string
    time: string;         // HH:MM
    location: string;
    city: string;
    category: string;
    capacity: number;
    tags?: string[];
    imageKey?: string;    // Arkiv entity key for event image
}

export interface RsvpData {
    attendeeName?: string;
    message?: string;
}

// Parsed types for UI consumption
export interface ParsedOrganizer extends OrganizerData {
    entityKey: string;
    wallet: string;
}

export interface ParsedEvent extends EventData {
    entityKey: string;
    organizer: string;
    status: string;
}

export interface ParsedRsvp extends RsvpData {
    entityKey: string;
    eventKey: string;
    attendee: string;
    status: string; // 'confirmed' | 'waitlisted'
}

export interface ParsedAttendance {
    entityKey: string;
    eventKey: string;
    attendee: string;
    checkedInBy: string;
    checkedInAt: string;
}

// ========================
// CONSTANTS
// ========================

const APP_PREFIX = 'arkeve';

export const CATEGORIES = [
    { name: 'Tech', emoji: '💻', badge: 'badge-orange' },
    { name: 'Music', emoji: '🎵', badge: 'badge-orange' },
    { name: 'Art', emoji: '🎨', badge: 'badge-orange' },
    { name: 'Business', emoji: '💼', badge: 'badge-orange' },
    { name: 'Community', emoji: '🤝', badge: 'badge-orange' },
    { name: 'Sports', emoji: '⚽', badge: 'badge-orange' },
    { name: 'Food', emoji: '🍕', badge: 'badge-orange' },
    { name: 'Education', emoji: '📚', badge: 'badge-orange' },
];

export const EXPIRY = {
    ORGANIZER: ExpirationTime.fromDays(365),    // Profiles last 1 year
    EVENT_BUFFER_DAYS: 7,                        // Events expire 7 days after event date
    RSVP_BUFFER_DAYS: 1,                         // RSVPs expire 1 day after event date
    ATTENDANCE_BUFFER_DAYS: 30,                  // Proof of attendance persists 30 days
};

// ========================
// HELPERS
// ========================

function getAttributeValue(entity: Entity, key: string): string {
    const attr = entity.attributes.find((a: Attribute) => a.key === key);
    return attr ? String(attr.value) : '';
}

function parsePayload<T>(entity: Entity): T {
    try {
        return entity.toJson() as T;
    } catch {
        if (!entity.payload) return {} as T;
        const decoder = new TextDecoder();
        const text = decoder.decode(entity.payload);
        return JSON.parse(text) as T;
    }
}

function daysUntil(dateStr: string, bufferDays: number): number {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime() + bufferDays * 86400000;
    const diffDays = Math.max(1, Math.ceil(diffMs / 86400000));
    return diffDays;
}

function parseEntityToEvent(entity: Entity): ParsedEvent {
    const data = parsePayload<EventData>(entity);
    return {
        ...data,
        entityKey: entity.key,
        organizer: getAttributeValue(entity, 'organizer'),
        category: getAttributeValue(entity, 'category'),
        city: getAttributeValue(entity, 'city'),
        status: getAttributeValue(entity, 'status') || 'upcoming',
        imageKey: getAttributeValue(entity, 'imageKey') || undefined,
    };
}

export function getCategoryBadge(category: string): string {
    const cat = CATEGORIES.find(
        (c) => c.name.toLowerCase() === category.toLowerCase()
    );
    return cat?.badge || 'badge-orange';
}

// ========================
// WRITE OPERATIONS
// Uses Wagmi's connector provider to prompt the browser wallet directly.
// ========================

export async function createOrganizerProfile(
    connector: Connector,
    walletAddress: `0x${string}`,
    data: OrganizerData
) {
    const client = await getArkivWalletClient(connector, walletAddress);

    const { entityKey, txHash } = await client.createEntity({
        payload: jsonToPayload(data),
        contentType: 'application/json',
        attributes: [
            { key: 'app', value: APP_PREFIX },
            { key: 'type', value: 'organizer' },
            { key: 'wallet', value: walletAddress.toLowerCase() },
            { key: 'name', value: data.name },
        ],
        expiresIn: EXPIRY.ORGANIZER,
    });

    return { entityKey, txHash };
}



export async function createEvent(
    connector: Connector,
    walletAddress: `0x${string}`,
    data: EventData
) {
    const client = await getArkivWalletClient(connector, walletAddress);
    const expiryDays = daysUntil(data.date, EXPIRY.EVENT_BUFFER_DAYS);

    const attributes: Attribute[] = [
        { key: 'app', value: APP_PREFIX },
        { key: 'type', value: 'event' },
        { key: 'organizer', value: walletAddress.toLowerCase() },
        { key: 'category', value: data.category.toLowerCase() },
        { key: 'city', value: data.city.toLowerCase() },
        { key: 'status', value: 'upcoming' },
        { key: 'date', value: data.date },
    ];

    if (data.imageKey) {
        attributes.push({ key: 'imageKey', value: data.imageKey });
    }

    const { entityKey, txHash } = await client.createEntity({
        payload: jsonToPayload({
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            location: data.location,
            capacity: data.capacity,
            tags: data.tags || [],
        }),
        contentType: 'application/json',
        attributes,
        expiresIn: ExpirationTime.fromDays(expiryDays),
    });

    return { entityKey, txHash };
}

export async function updateEventStatus(
    connector: Connector,
    walletAddress: `0x${string}`,
    event: ParsedEvent,
    newStatus: 'upcoming' | 'live' | 'ended'
) {
    const client = await getArkivWalletClient(connector, walletAddress);
    const expiryDays = daysUntil(event.date, EXPIRY.EVENT_BUFFER_DAYS);

    const attributes: Attribute[] = [
        { key: 'app', value: APP_PREFIX },
        { key: 'type', value: 'event' },
        { key: 'organizer', value: walletAddress.toLowerCase() },
        { key: 'category', value: event.category.toLowerCase() },
        { key: 'city', value: (event.city || '').toLowerCase() },
        { key: 'status', value: newStatus },
        { key: 'date', value: event.date },
    ];

    if (event.imageKey) {
        attributes.push({ key: 'imageKey', value: event.imageKey });
    }

    const { entityKey, txHash } = await client.updateEntity({
        entityKey: event.entityKey as Hex,
        payload: jsonToPayload({
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            capacity: event.capacity,
            tags: event.tags || [],
        }),
        contentType: 'application/json',
        attributes,
        expiresIn: ExpirationTime.fromDays(expiryDays),
    });

    return { entityKey, txHash };
}

export async function updateEvent(
    connector: Connector,
    walletAddress: `0x${string}`,
    existingEntityKey: string,
    data: EventData
) {
    const client = await getArkivWalletClient(connector, walletAddress);
    const expiryDays = daysUntil(data.date, EXPIRY.EVENT_BUFFER_DAYS);

    const attributes: Attribute[] = [
        { key: 'app', value: APP_PREFIX },
        { key: 'type', value: 'event' },
        { key: 'organizer', value: walletAddress.toLowerCase() },
        { key: 'category', value: data.category.toLowerCase() },
        { key: 'city', value: data.city.toLowerCase() },
        { key: 'status', value: 'upcoming' },
        { key: 'date', value: data.date },
    ];

    if (data.imageKey) {
        attributes.push({ key: 'imageKey', value: data.imageKey });
    }

    const { entityKey, txHash } = await client.updateEntity({
        entityKey: existingEntityKey as Hex,
        payload: jsonToPayload({
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            location: data.location,
            capacity: data.capacity,
            tags: data.tags || [],
        }),
        contentType: 'application/json',
        attributes,
        expiresIn: ExpirationTime.fromDays(expiryDays),
    });

    return { entityKey, txHash };
}

export async function createRsvp(
    connector: Connector,
    walletAddress: `0x${string}`,
    eventKey: string,
    data: RsvpData,
    eventDate: string,
    isWaitlist: boolean = false
) {
    const client = await getArkivWalletClient(connector, walletAddress);
    const expiryDays = daysUntil(eventDate, EXPIRY.RSVP_BUFFER_DAYS);

    const { entityKey, txHash } = await client.createEntity({
        payload: jsonToPayload(data),
        contentType: 'application/json',
        attributes: [
            { key: 'app', value: APP_PREFIX },
            { key: 'type', value: 'rsvp' },
            { key: 'eventKey', value: eventKey },
            { key: 'attendee', value: walletAddress.toLowerCase() },
            { key: 'status', value: isWaitlist ? 'waitlisted' : 'confirmed' },
        ],
        expiresIn: ExpirationTime.fromDays(expiryDays),
    });

    return { entityKey, txHash };
}

export async function createAttendance(
    connector: Connector,
    walletAddress: `0x${string}`,
    eventKey: string,
    attendeeWallet: string,
    eventDate: string
) {
    const client = await getArkivWalletClient(connector, walletAddress);
    const expiryDays = daysUntil(eventDate, EXPIRY.ATTENDANCE_BUFFER_DAYS);

    const { entityKey, txHash } = await client.createEntity({
        payload: jsonToPayload({
            checkedInAt: new Date().toISOString(),
        }),
        contentType: 'application/json',
        attributes: [
            { key: 'app', value: APP_PREFIX },
            { key: 'type', value: 'attendance' },
            { key: 'eventKey', value: eventKey },
            { key: 'attendee', value: attendeeWallet.toLowerCase() },
            { key: 'checkedInBy', value: walletAddress.toLowerCase() },
        ],
        expiresIn: ExpirationTime.fromDays(expiryDays),
    });

    return { entityKey, txHash };
}

// ========================
// READ / QUERY OPERATIONS
// ========================

export async function queryEvents(
    filters?: { category?: string; city?: string }
): Promise<ParsedEvent[]> {
    const conditions: ReturnType<typeof eq>[] = [
        eq('app', APP_PREFIX),
        eq('type', 'event'),
        eq('status', 'live'),
    ];

    if (filters?.category) {
        conditions.push(eq('category', filters.category.toLowerCase()));
    }
    if (filters?.city) {
        conditions.push(eq('city', filters.city.toLowerCase()));
    }

    const result = await publicClient
        .buildQuery()
        .where(conditions)
        .orderBy('date', 'string', 'asc')
        .withAttributes(true)
        .withPayload(true)
        .fetch();

    return (result.entities || []).map(parseEntityToEvent);
}

export async function queryEventByKey(
    key: string
): Promise<ParsedEvent | null> {
    try {
        const entity = await publicClient.getEntity(key as Hex);
        if (!entity) return null;

        const typeAttr = getAttributeValue(entity, 'type');
        if (typeAttr !== 'event') return null;

        return parseEntityToEvent(entity);
    } catch {
        return null;
    }
}

export async function queryRsvps(eventKey: string): Promise<ParsedRsvp[]> {
    const result = await publicClient
        .buildQuery()
        .where([
            eq('app', APP_PREFIX),
            eq('type', 'rsvp'),
            eq('eventKey', eventKey),
        ])
        .withAttributes(true)
        .withPayload(true)
        .fetch();

    return (result.entities || []).map((entity: Entity) => {
        const data = parsePayload<RsvpData>(entity);
        return {
            ...data,
            entityKey: entity.key,
            eventKey: getAttributeValue(entity, 'eventKey'),
            attendee: getAttributeValue(entity, 'attendee'),
            status: getAttributeValue(entity, 'status') || 'confirmed',
        };
    });
}

export async function queryAttendances(eventKey: string): Promise<ParsedAttendance[]> {
    const result = await publicClient
        .buildQuery()
        .where([
            eq('app', APP_PREFIX),
            eq('type', 'attendance'),
            eq('eventKey', eventKey),
        ])
        .withAttributes(true)
        .withPayload(true)
        .fetch();

    return (result.entities || []).map((entity: Entity) => {
        const data = parsePayload<{ checkedInAt?: string }>(entity);
        return {
            entityKey: entity.key,
            eventKey: getAttributeValue(entity, 'eventKey'),
            attendee: getAttributeValue(entity, 'attendee'),
            checkedInBy: getAttributeValue(entity, 'checkedInBy'),
            checkedInAt: data.checkedInAt || '',
        };
    });
}

export async function queryOrganizerByWallet(
    walletAddress: string
): Promise<ParsedOrganizer | null> {
    const result = await publicClient
        .buildQuery()
        .where([
            eq('app', APP_PREFIX),
            eq('type', 'organizer'),
            eq('wallet', walletAddress.toLowerCase()),
        ])
        .withAttributes(true)
        .withPayload(true)
        .fetch();

    const entities = result.entities || [];
    if (entities.length === 0) return null;

    const entity = entities[0];
    const data = parsePayload<OrganizerData>(entity);
    return {
        ...data,
        entityKey: entity.key,
        wallet: getAttributeValue(entity, 'wallet'),
    };
}

export async function queryEventsByOrganizer(
    walletAddress: string
): Promise<ParsedEvent[]> {
    const result = await publicClient
        .buildQuery()
        .where([
            eq('app', APP_PREFIX),
            eq('type', 'event'),
            eq('organizer', walletAddress.toLowerCase()),
        ])
        .withAttributes(true)
        .withPayload(true)
        .fetch();

    return (result.entities || []).map(parseEntityToEvent);
}

export async function checkExistingRsvp(
    eventKey: string,
    walletAddress: string
): Promise<boolean> {
    const result = await publicClient
        .buildQuery()
        .where([
            eq('app', APP_PREFIX),
            eq('type', 'rsvp'),
            eq('eventKey', eventKey),
            eq('attendee', walletAddress.toLowerCase()),
        ])
        .withAttributes(true)
        .fetch();

    return (result.entities || []).length > 0;
}

export async function getImageUrl(imageKeyOrBase64: string): Promise<string | null> {
    if (!imageKeyOrBase64) return null;
    if (imageKeyOrBase64.startsWith('data:image')) {
        return imageKeyOrBase64;
    }
    try {
        const entity = await publicClient.getEntity(imageKeyOrBase64 as Hex);
        if (!entity || !entity.payload) return null;
        const blob = new Blob([entity.payload as BlobPart], {
            type: entity.contentType || 'image/png',
        });
        return URL.createObjectURL(blob);
    } catch {
        return null;
    }
}
