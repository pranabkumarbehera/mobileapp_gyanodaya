import { Linking, Platform } from 'react-native';
import InAppUpdates, {
  AndroidNeedsUpdateResponse,
  IAUInstallStatus,
  IAUUpdateKind,
} from 'sp-react-native-in-app-updates';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.gyanodaya.newapp';

const inAppUpdates = new InAppUpdates(false);

const openPlayStore = async () => {
  await Linking.openURL(PLAY_STORE_URL).catch(() => undefined);
};

export const checkForAppUpdate = async (): Promise<void> => {
  if (Platform.OS !== 'android' || __DEV__) {
    return;
  }

  let statusListener:
    | ((status: { status: IAUInstallStatus }) => void)
    | undefined;

  const removeStatusListener = () => {
    if (statusListener) {
      inAppUpdates.removeStatusUpdateListener(statusListener);
      statusListener = undefined;
    }
  };

  try {
    const result =
      (await inAppUpdates.checkNeedsUpdate()) as AndroidNeedsUpdateResponse;

    if (!result.shouldUpdate) {
      return;
    }

    if (result.other?.isFlexibleUpdateAllowed) {
      statusListener = status => {
        if (status.status === IAUInstallStatus.DOWNLOADED) {
          inAppUpdates.installUpdate();
          return;
        }

        if (
          status.status === IAUInstallStatus.INSTALLED ||
          status.status === IAUInstallStatus.CANCELED ||
          status.status === IAUInstallStatus.FAILED
        ) {
          removeStatusListener();
        }
      };

      inAppUpdates.addStatusUpdateListener(statusListener);
      await inAppUpdates.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
      return;
    }

    if (result.other?.isImmediateUpdateAllowed) {
      await inAppUpdates.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
      return;
    }

    await openPlayStore();
  } catch (error) {
    removeStatusListener();
    await openPlayStore();
  }
};
