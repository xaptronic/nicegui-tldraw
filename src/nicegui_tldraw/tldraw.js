import "tldraw";

export default {
  template: `<div><slot name="sharePanel"></slot></div>`,
  mounted() {
    // window.__tldraw_socket_debug = true;
    const { root, promise } = tldraw.render(this.$el, {
      syncServer: this.sync_server,
      assetStoreUrl: this.asset_store_url,
      room: this.room,
      userPreferences: this.user_preferences,
      onFullscreenClick: this.on_fullscreen_click,
    });
    promise.then(({ methods }) => {
      ({
        getSnapshot: this.getSnapshot,
        loadSnapshot: this.loadSnapshot,
        toRichText: this.toRichText,
        getEditor: this.getEditor,
      } = methods);
      this.$emit("ready");
      console.log("ready");
    });
    this.root = root;
  },
  beforeUnmount() {
    if (this.root && this.root.unmount) {
      this.root.unmount();
    } else {
      console.log("no unmount");
    }
    this.getSnapshot = null;
    this.loadSnapshot = null;
    this.toRichText = null;
    this.getEditor = null;
    this.unmount = null;
  },
  methods: {
    save() {
      const editor = this.getEditor();
      if (editor) {
        const { document } = this.getSnapshot(editor.store);
        return JSON.stringify({ document });
      }
    },
    load(snapshot) {
      this.loadSnapshot(editor, JSON.parse(snapshot));
    },
    run_editor_method(name, ...args) {
      return runMethod(this.getEditor(), name, args);
    },
    on_fullscreen_click() {
      this.$el.requestFullscreen();
    },
  },
  props: {
    sync_server: String,
    asset_store_url: String,
    room: String,
    user_preferences: Object,
  },
};
