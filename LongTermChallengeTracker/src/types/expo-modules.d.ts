declare module 'expo-background-fetch' {
  export enum BackgroundFetchResult {
    NewData = 'newData',
    NoData = 'noData',
    Failed = 'failed',
  }

  export enum BackgroundFetchStatus {
    Restricted = 'restricted',
    Denied = 'denied',
    Available = 'available',
  }

  export interface BackgroundFetchOptions {
    minimumInterval: number;
  }

  export function getStatusAsync(): Promise<BackgroundFetchStatus>;
  export function registerTaskAsync(
    taskName: string,
    options?: BackgroundFetchOptions
  ): Promise<void>;
  export function unregisterTaskAsync(taskName: string): Promise<void>;
}

declare module 'expo-task-manager' {
  export interface TaskManagerTask {
    data: object;
    error: Error | null;
    executionInfo: {
      appState: 'active' | 'background' | 'inactive';
      taskName: string;
      trigger: 'location' | 'backgroundFetch';
    };
  }

  export function defineTask(
    taskName: string,
    task: (body: TaskManagerTask) => void
  ): void;
  export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;
  export function unregisterTaskAsync(taskName: string): Promise<void>;
  export function unregisterAllTasksAsync(): Promise<void>;
}

declare module 'expo-notifications' {
  export interface NotificationRequestInput {
    identifier?: string;
    content: {
      title?: string;
      subtitle?: string;
      body?: string;
      sound?: boolean | string;
      badge?: number;
      data?: object;
    };
    trigger: {
      seconds?: number;
      repeats?: boolean;
      channelId?: string;
      date?: Date;
    } | null;
  }

  export function scheduleNotificationAsync(
    notificationRequest: NotificationRequestInput
  ): Promise<string>;
  export function cancelScheduledNotificationAsync(
    identifier: string
  ): Promise<void>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  export function setNotificationHandler(handler: {
    handleNotification: (notification: any) => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;
}
