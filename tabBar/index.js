// tabBar/index.js
// custom-tab-bar/index.js
Component({
  data: {
    selected: 0, 
    tabs: [
      {
        pagePath: "/pages/index/index",
        text: "自习室"
      },
      {
        pagePath: "/pages/mybookings/mybookings",
        text: "我的预约"
      }
    ]
  },

  methods: {
    onTabTap(e) {
      const index = e.currentTarget.dataset.index;
      const tab = this.data.tabs[index];

      if (!tab) return;

      if (index === this.data.selected) {
        return;
      }

      wx.switchTab({
        url: tab.pagePath
      });

      this.setData({
        selected: index
      });
    },

    setSelected(index) {
      this.setData({
        selected: index
      });
    }
  }
});
