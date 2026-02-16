import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { ImageMetadata } from '../backend';

export function useListImages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[bigint, ImageMetadata]>>({
    queryKey: ['images'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listImages();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUploadImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      onProgress,
    }: {
      file: File;
      title: string;
      description: string;
      onProgress?: (percentage: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      let blob = ExternalBlob.fromBytes(bytes);
      
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }

      const imageId = await actor.uploadImage(blob, title, description);
      return imageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}
