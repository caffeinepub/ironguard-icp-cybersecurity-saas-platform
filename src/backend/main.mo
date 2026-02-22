import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  include MixinStorage();

  type UserRole = AccessControl.UserRole;

  type SubscriptionTier = {
    name : Text;
    pricePerMonth : Nat;
    includedStorageGb : Nat;
    overageCostPerGbCents : Nat;
  };

  type BusinessProfile = {
    businessName : Text;
    industry : Text;
    size : Text;
    billingDetails : Text;
    storageEstimateGb : Nat;
    subscriptionTier : Text;
    contactEmail : Text;
  };

  type FileMetadata = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    sizeBytes : Nat;
    ownerBusinessId : Text;
    // Add encryption info if needed
  };

  module BusinessProfile {
    public func compare(a : BusinessProfile, b : BusinessProfile) : Order.Order {
      Text.compare(a.businessName, b.businessName);
    };
  };

  module FileMetadata {
    public func compare(a : FileMetadata, b : FileMetadata) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type Invoice = {
    id : Text;
    businessId : Text;
    amountCents : Nat;
    periodStart : Nat;
    periodEnd : Nat;
    status : Text;
    invoiceUrl : Text;
  };

  type StorageUsage = {
    businessId : Text;
    totalStorageBytes : Nat;
    lastUpdated : Nat;
  };

  type ApiToken = {
    businessId : Text;
    token : Text;
    permissions : [Text];
    createdAt : Nat;
  };

  type KeyVaultEntry = {
    businessId : Text;
    encryptedKey : Text;
    createdAt : Nat;
    metadata : Text;
  };

  // Theme support
  type ThemePreference = {
    businessId : Text;
    theme : Text; // "light" or "dark"
  };
  let themePreferences = Map.empty<Text, ThemePreference>();

  // Session tracking for Stripe
  type StripeSession = {
    sessionId : Text;
    businessId : Text;
    createdAt : Nat;
  };
  let stripeSessions = Map.empty<Text, StripeSession>();

  // Billing status tracker
  type BillingStatus = {
    #active;
    #grace;
    #restricted;
  };

  type PaymentFailureLog = {
    timestamp : Nat;
    reason : Text;
    amount : Nat;
    attempts : Nat;
    lastAttempt : Nat;
  };

  type BillingRecord = {
    businessId : Text;
    status : BillingStatus;
    gracePeriodStart : ?Nat;
    lastRestrictionTime : ?Nat;
    paymentFailureLogs : [PaymentFailureLog];
    retryAttempts : Nat;
    nextRetryTime : ?Nat;
  };

  // Upgrade for persistent BillingRecord storage
  let billingRecordsStore = Map.empty<Text, BillingRecord>();

  // State
  let accessControlState = AccessControl.initState();
  let businessProfiles = Map.empty<Text, BusinessProfile>();
  let fileMetadataStore = Map.empty<Text, FileMetadata>();
  let stripeConfigurationStore = Map.empty<Text, Stripe.StripeConfiguration>();
  let invoicesStore = Map.empty<Text, Invoice>();
  let supportRequests = Map.empty<Text, SupportRequest>();

  type SupportRequest = {
    id : Text;
    fullName : Text;
    businessEmail : Text;
    organizationName : Text;
    supportCategory : SupportCategory;
    description : Text;
    submittedAt : Nat;
    status : SupportStatus;
  };

  type SupportCategory = {
    #billing;
    #technicalIssue;
    #security;
    #accountAccess;
    #other;
  };

  type SupportStatus = {
    #open;
    #inProgress;
    #resolved;
    #closed;
  };

  // ==============
  // = Support =
  // ==============

  // Public endpoint - anyone can submit a support request (including anonymous users)
  public shared ({ caller }) func submitSupportRequest(
    id : Text,
    fullName : Text,
    businessEmail : Text,
    organizationName : Text,
    supportCategory : SupportCategory,
    description : Text,
    submittedAt : Nat,
  ) : async () {
    // Validate input (basic validation)
    if (fullName == "" or businessEmail == "" or description == "" or organizationName == "") {
      Runtime.trap("Full name, business email, organization name, and description are required");
    };

    let request : SupportRequest = {
      id;
      fullName;
      businessEmail;
      organizationName;
      supportCategory;
      description;
      submittedAt;
      status = #open;
    };

    supportRequests.add(id, request);
  };

  // Admin-only - support requests may contain sensitive information
  public query ({ caller }) func getSupportRequest(id : Text) : async ?SupportRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view support requests");
    };
    supportRequests.get(id);
  };

  public query ({ caller }) func getAllSupportRequests() : async [SupportRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all support requests");
    };
    supportRequests.values().toArray();
  };

  public shared ({ caller }) func updateSupportRequestStatus(id : Text, status : SupportStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update support request status");
    };

    switch (supportRequests.get(id)) {
      case (null) {
        Runtime.trap("Support request not found");
      };
      case (?request) {
        let updatedRequest = { request with status };
        supportRequests.add(id, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func deleteSupportRequest(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete support requests");
    };
    supportRequests.remove(id);
  };

  // =================
  // = Authorization =
  // =================

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerBusinessProfile() : async ?BusinessProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must have user role");
    };
    businessProfiles.get(caller.toText());
  };

  public query ({ caller }) func getBusinessProfile(businessId : Text) : async ?BusinessProfile {
    if (
      caller.toText() != businessId and not (AccessControl.isAdmin(accessControlState, caller))
    ) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    businessProfiles.get(businessId);
  };

  public shared ({ caller }) func saveCallerBusinessProfile(profile : BusinessProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must have user role");
    };
    businessProfiles.add(caller.toText(), profile);
  };

  public query ({ caller }) func getAllBusinessProfiles() : async [BusinessProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all business profiles");
    };
    businessProfiles.values().toArray().sort();
  };

  public shared ({ caller }) func deleteBusinessProfile(businessId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete business profiles");
    };
    businessProfiles.remove(businessId);
  };

  // ==============
  // = Theme Support =
  // ================
  // Store/retrieve user's theme preference (light/dark)
  public shared ({ caller }) func saveThemePreference(theme : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    let preference : ThemePreference = {
      businessId = caller.toText();
      theme;
    };

    themePreferences.add(caller.toText(), preference);
  };

  public query ({ caller }) func getThemePreference() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };
    switch (themePreferences.get(caller.toText())) {
      case (null) { null };
      case (?pref) { ?pref.theme };
    };
  };

  public shared ({ caller }) func deleteThemePreference() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };
    themePreferences.remove(caller.toText());
  };

  // ===========
  // = Stripe  =
  // ==========

  // Admin-only: Stripe configuration status is sensitive platform information
  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check Stripe configuration status");
    };
    stripeConfigurationStore.get("default") != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfigurationStore.add("default", config);
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfigurationStore.get("default")) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role to create checkout session");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    // Track session ownership
    let session : StripeSession = {
      sessionId;
      businessId = caller.toText();
      createdAt = 0; // In production, use a proper timestamp
    };
    stripeSessions.add(sessionId, session);

    sessionId;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Verify session ownership
    switch (stripeSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Session not found or unauthorized");
      };
      case (?session) {
        if (
          session.businessId != caller.toText() and not (AccessControl.isAdmin(accessControlState, caller))
        ) {
          Runtime.trap("Unauthorized: Can only view your own sessions");
        };
      };
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ===========
  // = Storage =
  // ==========

  public shared ({ caller }) func saveBusinessFileMetadata(businessId : Text, file : FileMetadata) : async () {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Verify caller owns the businessId they're trying to save files for
    if (caller.toText() != businessId) {
      Runtime.trap("Unauthorized: Can only save files for your own business");
    };

    // Verify the file's ownerBusinessId matches the businessId parameter
    if (file.ownerBusinessId != businessId) {
      Runtime.trap("Unauthorized: File ownerBusinessId must match businessId");
    };

    // Check billing status - restricted accounts cannot upload files
    let billingStatus = getBillingStatusInternal(businessId);
    if (billingStatus == #restricted) {
      Runtime.trap("Service restricted: Cannot upload files due to payment issues. Please update your payment method.");
    };

    fileMetadataStore.add(file.id, file);
  };

  public query ({ caller }) func getFileMetadata(id : Text) : async ?FileMetadata {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    let file = fileMetadataStore.get(id);

    switch (file) {
      case (null) { null };
      case (?f) {
        // Verify caller owns the file or is admin
        if (
          caller.toText() != f.ownerBusinessId and not (AccessControl.isAdmin(accessControlState, caller))
        ) {
          Runtime.trap("Unauthorized: Can only view your own files");
        };
        file;
      };
    };
  };

  public query ({ caller }) func getBusinessFiles(businessId : Text) : async [FileMetadata] {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Verify caller owns the businessId or is admin
    if (
      caller.toText() != businessId and not (AccessControl.isAdmin(accessControlState, caller))
    ) {
      Runtime.trap("Unauthorized: Can only view your own business files");
    };

    // Filter files by businessId
    let allFiles = fileMetadataStore.values();
    let filtered = allFiles.filter(func(file : FileMetadata) : Bool {
      file.ownerBusinessId == businessId
    });

    filtered.toArray().sort();
  };

  public shared ({ caller }) func deleteFileMetadata(id : Text) : async () {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Get the file to verify ownership
    let file = fileMetadataStore.get(id);

    switch (file) {
      case (null) {
        Runtime.trap("File not found");
      };
      case (?f) {
        // Verify caller owns the file or is admin
        if (
          caller.toText() != f.ownerBusinessId and not (AccessControl.isAdmin(accessControlState, caller))
        ) {
          Runtime.trap("Unauthorized: Can only delete your own files");
        };
        fileMetadataStore.remove(id);
      };
    };
  };

  // ===============
  // = Billing System V2 =
  // ===============
  // Retry policy (in seconds)
  let retryDelays = [0, 86400, 259200]; // Immediate, 24 hours, 72 hours

  // Internal helper to get billing status without authorization
  func getBillingStatusInternal(businessId : Text) : BillingStatus {
    switch (billingRecordsStore.get(businessId)) {
      case (null) { #active };
      case (?record) { record.status };
    };
  };

  // Get billing record for businessId with default Active state
  func getBillingRecord(businessId : Text) : BillingRecord {
    switch (billingRecordsStore.get(businessId)) {
      case (null) {
        let defaultRecord : BillingRecord = {
          businessId;
          status = #active;
          gracePeriodStart = null;
          lastRestrictionTime = null;
          paymentFailureLogs = [];
          retryAttempts = 0;
          nextRetryTime = null;
        };
        defaultRecord;
      };
      case (?record) { record };
    };
  };

  // Update or add billing record
  func updateBillingRecord(businessId : Text, record : BillingRecord) {
    billingRecordsStore.add(businessId, record);
  };

  // Handle failed payment event - Admin only (webhook handler)
  public shared ({ caller }) func handleFailedPayment(
    businessId : Text,
    reason : Text,
    amount : Nat,
    timestamp : Nat,
  ) : async () {
    // Only admin can trigger failed payment events (webhook handler)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can handle failed payment events");
    };

    let paymentLog : PaymentFailureLog = {
      timestamp;
      reason;
      amount;
      attempts = 0;
      lastAttempt = timestamp;
    };

    let record = getBillingRecord(businessId);

    // Set grace period start if not already set
    let graceStartTime = switch (record.gracePeriodStart) {
      case (null) { ?timestamp };
      case (?existing) { ?existing };
    };

    let newRecord : BillingRecord = {
      record with
      status = #grace;
      gracePeriodStart = graceStartTime;
      paymentFailureLogs = [paymentLog].concat(record.paymentFailureLogs);
      retryAttempts = 1;
      nextRetryTime = ?(timestamp + retryDelays[1]);
    };

    updateBillingRecord(businessId, newRecord);
  };

  // Retry payment attempt - Admin only (webhook handler)
  public shared ({ caller }) func retryPaymentAttempt(
    businessId : Text,
    attempt : Nat,
    timestamp : Nat,
  ) : async () {
    // Only admin can trigger retry attempts (webhook handler)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can retry payment attempts");
    };

    let billingRecord = getBillingRecord(businessId);

    // Update last retry in failed payment log
    let updatedLogs = billingRecord.paymentFailureLogs.map(
      func(log) {
        {
          log with
          attempts = attempt;
          lastAttempt = timestamp;
        };
      }
    );

    let newRecord : BillingRecord = {
      billingRecord with
      paymentFailureLogs = updatedLogs;
      retryAttempts = attempt + 1;
      nextRetryTime = if (attempt < retryDelays.size()) {
        ?(timestamp + retryDelays[attempt]);
      } else { null };
    };

    updateBillingRecord(businessId, newRecord);
  };

  // Check service access - User can only check their own status, admin can check any
  public query ({ caller }) func checkServiceAccess(businessId : Text) : async BillingStatus {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Verify caller owns the businessId or is admin
    if (
      caller.toText() != businessId and not (AccessControl.isAdmin(accessControlState, caller))
    ) {
      Runtime.trap("Unauthorized: Can only check your own service access");
    };

    getBillingStatusInternal(businessId);
  };

  // Grace period check - User can only check their own status, admin can check any
  public query ({ caller }) func isInGracePeriod(businessId : Text) : async Bool {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Verify caller owns the businessId or is admin
    if (
      caller.toText() != businessId and not (AccessControl.isAdmin(accessControlState, caller))
    ) {
      Runtime.trap("Unauthorized: Can only check your own grace period status");
    };

    switch (billingRecordsStore.get(businessId)) {
      case (null) { false };
      case (?record) {
        record.status == #grace;
      };
    };
  };

  // Service restriction check - User can only check their own status, admin can check any
  public query ({ caller }) func isServiceRestricted(businessId : Text) : async Bool {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Verify caller owns the businessId or is admin
    if (
      caller.toText() != businessId and not (AccessControl.isAdmin(accessControlState, caller))
    ) {
      Runtime.trap("Unauthorized: Can only check your own restriction status");
    };

    switch (billingRecordsStore.get(businessId)) {
      case (null) { false };
      case (?record) {
        record.status == #restricted;
      };
    };
  };

  // Reactivate service - Admin only (webhook handler)
  public shared ({ caller }) func handleSuccessfulPayment(
    businessId : Text,
    amount : Nat,
    timestamp : Nat,
  ) : async () {
    // Only admin can trigger successful payment events (webhook handler)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can handle successful payment events");
    };

    let record = getBillingRecord(businessId);

    let newRecord : BillingRecord = {
      record with
      status = #active;
      gracePeriodStart = null;
      lastRestrictionTime = null;
      retryAttempts = 0;
      nextRetryTime = null;
    };

    updateBillingRecord(businessId, newRecord);
  };

  // Admin override status - Admin only
  public shared ({ caller }) func manuallySetBillingStatus(
    businessId : Text,
    status : BillingStatus,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can modify billing status");
    };
    let record = getBillingRecord(businessId);

    let newRecord : BillingRecord = {
      record with
      status;
    };

    updateBillingRecord(businessId, newRecord);
  };

  // Get billing status - User can only check their own status, admin can check any
  public query ({ caller }) func getBillingStatus(businessId : Text) : async BillingStatus {
    // Verify caller is authorized as a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };

    // Verify caller owns the businessId or is admin
    if (
      caller.toText() != businessId and not (AccessControl.isAdmin(accessControlState, caller))
    ) {
      Runtime.trap("Unauthorized: Can only view your own billing status");
    };

    getBillingStatusInternal(businessId);
  };

  // Get customer's own billing status
  public query ({ caller }) func getCustomerBillingStatus() : async BillingStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };
    getBillingStatusInternal(caller.toText());
  };

  // Admin-only: Get all billing records for admin panel
  public query ({ caller }) func getAllBillingRecords() : async [BillingRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all billing records");
    };
    billingRecordsStore.values().toArray();
  };

  // Admin-only: Get specific billing record with full details
  public query ({ caller }) func getBillingRecordDetails(businessId : Text) : async ?BillingRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view billing record details");
    };
    billingRecordsStore.get(businessId);
  };
};
