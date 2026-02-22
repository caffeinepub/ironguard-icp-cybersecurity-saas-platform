import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  BusinessProfile,
  FileMetadata,
  StripeConfiguration,
  ShoppingItem,
  UserRole,
  SupportCategory,
  SupportRequest,
  SupportStatus,
  BillingStatus,
  BillingRecord,
} from '../backend';
import { ExternalBlob } from '../backend';

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Business Profile Queries
export function useGetCallerBusinessProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<BusinessProfile | null>({
    queryKey: ['callerBusinessProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerBusinessProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerBusinessProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: BusinessProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerBusinessProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerBusinessProfile'] });
    },
  });
}

export function useGetAllBusinessProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<BusinessProfile[]>({
    queryKey: ['allBusinessProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBusinessProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// File Management Queries
export function useGetBusinessFiles(businessId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<FileMetadata[]>({
    queryKey: ['businessFiles', businessId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBusinessFiles(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useSaveBusinessFileMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      file,
    }: {
      businessId: string;
      file: FileMetadata;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveBusinessFileMetadata(businessId, file);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['businessFiles', variables.businessId],
      });
    },
  });
}

export function useDeleteFileMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, businessId }: { id: string; businessId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFileMetadata(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['businessFiles', variables.businessId],
      });
    },
  });
}

// Stripe Configuration Queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

// Checkout Session
export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<{ id: string; url: string }> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      return session;
    },
  });
}

// Theme Preference Queries
export function useGetThemePreference() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['themePreference'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getThemePreference();
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity, // Theme preference doesn't change often
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });
}

export function useSaveThemePreference() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveThemePreference(theme);
    },
    onSuccess: (_, theme) => {
      // Optimistically update the cache
      queryClient.setQueryData(['themePreference'], theme);
    },
  });
}

// Support Request Queries
export function useSubmitSupportRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      fullName,
      businessEmail,
      organizationName,
      supportCategory,
      description,
    }: {
      fullName: string;
      businessEmail: string;
      organizationName: string;
      supportCategory: SupportCategory;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const id = `support-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const submittedAt = BigInt(Date.now());

      return actor.submitSupportRequest(
        id,
        fullName,
        businessEmail,
        organizationName,
        supportCategory,
        description,
        submittedAt
      );
    },
  });
}

export function useGetAllSupportRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<SupportRequest[]>({
    queryKey: ['allSupportRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllSupportRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSupportRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: SupportStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSupportRequestStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupportRequests'] });
    },
  });
}

// Billing Status Queries
export function useGetCustomerBillingStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<BillingStatus>({
    queryKey: ['customerBillingStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomerBillingStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds to keep status current
  });
}

export function useGetBillingStatus(businessId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BillingStatus>({
    queryKey: ['billingStatus', businessId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBillingStatus(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useCheckServiceAccess(businessId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BillingStatus>({
    queryKey: ['serviceAccess', businessId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkServiceAccess(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useIsInGracePeriod(businessId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['gracePeriod', businessId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isInGracePeriod(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useIsServiceRestricted(businessId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['serviceRestricted', businessId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isServiceRestricted(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

// Admin-only Billing Management Queries
export function useGetAllBillingRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<BillingRecord[]>({
    queryKey: ['allBillingRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBillingRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBillingRecordDetails(businessId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BillingRecord | null>({
    queryKey: ['billingRecordDetails', businessId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBillingRecordDetails(businessId);
    },
    enabled: !!actor && !isFetching && !!businessId,
  });
}

export function useManuallySetBillingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      status,
    }: {
      businessId: string;
      status: BillingStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.manuallySetBillingStatus(businessId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBillingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['billingRecordDetails'] });
      queryClient.invalidateQueries({ queryKey: ['customerBillingStatus'] });
    },
  });
}

// Admin webhook handlers (for testing/simulation)
export function useHandleFailedPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      reason,
      amount,
    }: {
      businessId: string;
      reason: string;
      amount: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const timestamp = BigInt(Date.now());
      return actor.handleFailedPayment(businessId, reason, BigInt(amount), timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBillingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['customerBillingStatus'] });
    },
  });
}

export function useHandleSuccessfulPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      amount,
    }: {
      businessId: string;
      amount: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const timestamp = BigInt(Date.now());
      return actor.handleSuccessfulPayment(businessId, BigInt(amount), timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBillingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['customerBillingStatus'] });
    },
  });
}
