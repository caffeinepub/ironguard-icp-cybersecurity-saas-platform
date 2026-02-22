import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PaymentFailureLog {
    attempts: bigint;
    timestamp: bigint;
    amount: bigint;
    lastAttempt: bigint;
    reason: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface FileMetadata {
    id: string;
    blob: ExternalBlob;
    name: string;
    ownerBusinessId: string;
    sizeBytes: bigint;
}
export interface BillingRecord {
    status: BillingStatus;
    businessId: string;
    paymentFailureLogs: Array<PaymentFailureLog>;
    lastRestrictionTime?: bigint;
    gracePeriodStart?: bigint;
    nextRetryTime?: bigint;
    retryAttempts: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface SupportRequest {
    id: string;
    status: SupportStatus;
    organizationName: string;
    fullName: string;
    submittedAt: bigint;
    description: string;
    businessEmail: string;
    supportCategory: SupportCategory;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface BusinessProfile {
    billingDetails: string;
    size: string;
    subscriptionTier: string;
    businessName: string;
    storageEstimateGb: bigint;
    contactEmail: string;
    industry: string;
}
export enum BillingStatus {
    active = "active",
    grace = "grace",
    restricted = "restricted"
}
export enum SupportCategory {
    technicalIssue = "technicalIssue",
    accountAccess = "accountAccess",
    other = "other",
    security = "security",
    billing = "billing"
}
export enum SupportStatus {
    resolved = "resolved",
    closed = "closed",
    open = "open",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkServiceAccess(businessId: string): Promise<BillingStatus>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteBusinessProfile(businessId: string): Promise<void>;
    deleteFileMetadata(id: string): Promise<void>;
    deleteSupportRequest(id: string): Promise<void>;
    deleteThemePreference(): Promise<void>;
    getAllBillingRecords(): Promise<Array<BillingRecord>>;
    getAllBusinessProfiles(): Promise<Array<BusinessProfile>>;
    getAllSupportRequests(): Promise<Array<SupportRequest>>;
    getBillingRecordDetails(businessId: string): Promise<BillingRecord | null>;
    getBillingStatus(businessId: string): Promise<BillingStatus>;
    getBusinessFiles(businessId: string): Promise<Array<FileMetadata>>;
    getBusinessProfile(businessId: string): Promise<BusinessProfile | null>;
    getCallerBusinessProfile(): Promise<BusinessProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerBillingStatus(): Promise<BillingStatus>;
    getFileMetadata(id: string): Promise<FileMetadata | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSupportRequest(id: string): Promise<SupportRequest | null>;
    getThemePreference(): Promise<string | null>;
    handleFailedPayment(businessId: string, reason: string, amount: bigint, timestamp: bigint): Promise<void>;
    handleSuccessfulPayment(businessId: string, amount: bigint, timestamp: bigint): Promise<void>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isInGracePeriod(businessId: string): Promise<boolean>;
    isServiceRestricted(businessId: string): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    manuallySetBillingStatus(businessId: string, status: BillingStatus): Promise<void>;
    retryPaymentAttempt(businessId: string, attempt: bigint, timestamp: bigint): Promise<void>;
    saveBusinessFileMetadata(businessId: string, file: FileMetadata): Promise<void>;
    saveCallerBusinessProfile(profile: BusinessProfile): Promise<void>;
    saveThemePreference(theme: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitSupportRequest(id: string, fullName: string, businessEmail: string, organizationName: string, supportCategory: SupportCategory, description: string, submittedAt: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateSupportRequestStatus(id: string, status: SupportStatus): Promise<void>;
}
