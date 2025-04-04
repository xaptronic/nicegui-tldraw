import React, { useCallback, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Tldraw,
  getSnapshot,
  loadSnapshot,
  uniqueId,
  useTldrawUser,
  toRichText,
} from "tldraw";
import { useSync } from "@tldraw/sync";
import "tldraw/tldraw.css";

const createAssetStore = (baseUrl) => ({
  async upload(_asset, file) {
    const id = uniqueId();
    const objectName = `${id}-${file.name}`.replaceAll(/\W/g, "-");
    const url = `${baseUrl}/upload/${objectName}`;

    const response = await fetch(url, {
      method: "POST",
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload asset: ${response.statusText}`);
    }
    return { src: url, meta: {} };
  },
  // could use this to get a signed url
  async resolve(asset) {
    return asset.props.src;
  },
});

const FullscreenButton = (props) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { target } = props;
  const handleEnterFullscreen = () => {
    if (target) {
      target.requestFullscreen();
    }
  };
  if (target) {
    target.addEventListener(
      "fullscreenchange",
      useCallback(() => {
        if (document.fullscreenElement) {
          setIsFullscreen(true);
        } else {
          setIsFullscreen(false);
        }
      })
    );
  }

  return (
    <button
      type="button"
      class="tlui-button tlui-button tlui-button__icon tlui-button-grid__button"
      onClick={handleEnterFullscreen}
      style={isFullscreen ? { display: "none" } : {}}
    >
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          fill="#000000e5"
          fill-rule="evenodd"
          d="m17 7.707-3.146 3.147a.5.5 0 0 1-.708-.708L16.293 7H13.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0zm-6.854 5.44a.5.5 0 0 1 .708.707L7.707 17H10.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 1 0v2.793z"
          clip-rule="evenodd"
        ></path>
      </svg>
    </button>
  );
};

const TldrawWrapperWithoutSync = ({ props, container, onReady }) => {
  const editorRef = useRef(null);
  const { assetStoreUrl, userPreferences, ...restProps } = props;

  const handleMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      if (onReady) {
        onReady({
          getSnapshot: getSnapshot,
          loadSnapshot: loadSnapshot,
          toRichText: toRichText,
          getEditor: () => {
            return editorRef.current;
          },
        });
      }
    },
    [onReady]
  );

  const assetStore = useMemo(
    () => createAssetStore(assetStoreUrl),
    [assetStoreUrl]
  );

  const user = useTldrawUser({ userPreferences });

  return (
    <Tldraw
      onMount={handleMount}
      store={assetStore}
      user={user}
      components={{
        SharePanel: (componentProps) => (
          <FullscreenButton target={container} {...componentProps} />
        ),
      }}
      {...restProps}
    />
  );
};

const TldrawWrapperWithSync = ({ props, container, onReady }) => {
  const editorRef = useRef(null);
  const { syncServer, room, assetStoreUrl, userPreferences, ...restProps } = props;

  const handleMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      if (onReady) {
        onReady({
          getSnapshot: getSnapshot,
          loadSnapshot: loadSnapshot,
          toRichText: toRichText,
          getEditor: () => {
            return editorRef.current;
          },
        });
      }
    },
    [onReady]
  );

  const assetStore = useMemo(
    () => createAssetStore(assetStoreUrl),
    [assetStoreUrl]
  );

  const user = useTldrawUser({ userPreferences });

  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const store = useSync({
    uri: `${proto}://${syncServer}/_nicegui_tldraw/connect/${room}`,
    assets: assetStore,
    userInfo: userPreferences,
  });

  return (
    <Tldraw
      onMount={handleMount}
      store={store}
      user={user}
      components={{
        SharePanel: (componentProps) => (
          <FullscreenButton target={container} {...componentProps} />
        ),
      }}
      {...restProps}
    />
  );
};

const TldrawWrapper = ({ props, container, onReady }) => {
  const { syncServer } = props;

  if (syncServer) {
    console.log("make sync server instance", syncServer);
    return (
      <TldrawWrapperWithSync
        props={props}
        container={container}
        onReady={onReady}
      />
    );
  }

  console.log("non sync instance", syncServer);
  return (
    <TldrawWrapperWithoutSync
      props={props}
      container={container}
      onReady={onReady}
    />
  );
};

export const render = (elOrSelector, props = {}) => {
  let container;
  if (elOrSelector instanceof HTMLElement) {
    container = elOrSelector;
  } else {
    container = document.querySelector(elOrSelector);
    if (!container) {
      throw new Error(`No element found for selector "${elOrSelector}"`);
    }
  }
  const root = createRoot(container);

  const promise = new Promise((resolve) => {
    root.render(
      <TldrawWrapper
        props={props}
        container={container}
        onReady={(instance) => {
          resolve({
            methods: instance,
          });
        }}
      />
    );
  });

  return { root, promise };
};
