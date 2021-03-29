export const statte = () => ({
  devices: [],
  auth: null,
  selectedDevice: {},
  notifications: [],
});

export const mutations = {
  setAuth(state, auth) {
    state.auth = auth;
  },
  setDevices(state, devices) {
    state.devices = devices;
  },
  setSelectedDevice(state, device) {
    state.selectedDevice = device;
  }, 
  setNotifications(state,notifications) {
    state.notifications = notifications;
  }
};

export const actions = {
  readToken() {
    let auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("auth"));
    } catch (error) {
      console.log(error);
    }

    this.commit("setAuth", auth);
  },
  getDevices() {
    let config = {
      headers: {
        token: this.state.auth.token
      }
    };
    this.$axios
      .get("/devices", config)
      .then(res => {
        let devices = res.data.data;

        res.data.data.forEach((device, index) => {
          if (device.selected) {
            this.commit("setSelectedDevice", device);
            $nuxt.$emit("selectedDeviceIndex", index);
          }
        });

        this.commit("setDevices", devices);
      })
      .catch(err => {
        console.log(err.response);
      });
  },
  getNotifications(){
    let config = {
      headers: {
        token: this.state.auth.token
      }
    }
    this.$axios.get('/notifications', config)
    .then(res => {
      let notif = res.data.data
      let notifCorrect = notif.reverse()
      this.commit('setNotifications', notifCorrect)
    })
    .catch(err => {
      console.log(err.response);
    })
  }
};
