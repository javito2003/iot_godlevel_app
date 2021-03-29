<template>
  <base-nav
    v-model="showMenu"
    class="navbar-absolute top-navbar"
    type="white"
    :transparent="true"
  >
    <div slot="brand" class="navbar-wrapper">
      <div
        class="navbar-toggle d-inline"
        :class="{ toggled: $sidebar.showSidebar }"
      >
        <button type="button" class="navbar-toggler" @click="toggleSidebar">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </button>
      </div>
      <a class="navbar-brand ml-xl-3 ml-5" href="#pablo">{{ routeName }}</a>
    </div>

    <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
      <el-select
        @change="selectDevice()"
        v-model="selectedDevice"
        class="select-success"
        placeholder="Select Device"
      >
        <el-option
          v-for="(device, index) in $store.state.devices"
          :key="index"
          :value="index"
          :label="device.name"
        ></el-option>
      </el-select>

      <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        title-classes="nav-link"
        class="nav-item"
      >
        <template slot="title">
          <div v-if="this.$store.state.notifications.length > 0" class="notification d-none d-lg-block d-xl-block"></div>
          <i class="tim-icons icon-sound-wave"></i>
          <p class="d-lg-none">New Notifications</p>
        </template>
        <li @click="notificationReaded(notification._id)" class="nav-link" v-for="(notification,index) in $store.state.notifications" :key="index">
          <a href="#" class="nav-item dropdown-item">
            <b style="color:orangered">{{unixToDate(notification.time)}}</b>
            <div style="margin-left:50px">
              <b>Device: </b> {{notification.deviceName}} <br>
              <b>Variable: </b> {{notification.variable}} <br>
              <b>Limit: </b> {{notification.value}} <br>
              <b>Condition: </b> {{notification.condition}} <br>
              <b>Value: </b> {{notification.payload.value}}
            </div>
          </a>
        </li>
      </base-dropdown>
      <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        class="nav-item"
        title-classes="nav-link"
        menu-classes="dropdown-navbar"
      >
        <template slot="title">
          <div class="photo">
            <img
              src="data:image/jpeg;base64,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"
            />
          </div>
          <b class="caret d-none d-lg-block d-xl-block"></b>
          <p class="d-lg-none">Log out</p>
        </template>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Profile</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Settings</a>
        </li>
        <div class="dropdown-divider"></div>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Log out</a>
        </li>
      </base-dropdown>
    </ul>
  </base-nav>
</template>
<script>
import { CollapseTransition } from "vue2-transitions";
import { BaseNav, Modal } from "@/components";
import { Select, Option } from "element-ui";

export default {
  components: {
    CollapseTransition,
    BaseNav,
    Modal,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  computed: {
    routeName() {
      const { path } = this.$route;
      let parts = path.split("/");
      if (parts == ",") {
        return "Dashboard";
      }
      return parts.map((p) => this.capitalizeFirstLetter(p)).join(" ");
    },
    isRTL() {
      return this.$rtl.isRTL;
    },
  },
  data() {
    return {
      activeNotifications: false,
      showMenu: false,
      searchModalVisible: false,
      searchQuery: "",
      selectedDevice: null,
    };
  },
  mounted() {
    this.$store.dispatch("getDevices");
    this.$nuxt.$on('selectedDeviceIndex', this.updateSelectedDeviceIndex)
  },
  methods: {
    updateSelectedDeviceIndex(index) {
      this.selectedDevice = index
      console.log(this.selectedDevice);
    },
    selectDevice(){
      const device = this.$store.state.devices[this.selectedDevice]

      const config = {
        headers: {
          token: this.$store.state.auth.token,
        }
      }

      const toSend = {
        dId: device.dId,
      }

      this.$axios.put('/device', toSend, config)
      .then((res) =>{
        console.log(res.data);

        this.$store.dispatch('getDevices')
      })
      .catch((err) =>{
        console.log(err.response);
      })
    },
    notificationReaded(notifId){
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        }
      }
      const toSend = {
        notifId: notifId
      }
      this.$axios.put('/notifications',toSend, config)
      .then(res => {
        console.log(res.data);
        this.$store.dispatch('getNotifications')
      })
      .catch((err) =>{
        console.log(err.response);
      })

    },

    capitalizeFirstLetter(string) {
      if (!string || typeof string !== "string") {
        return "";
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    //UNIX TO DATE
    unixToDate(s){
      var d = new Date(parseInt(s)),// Conver the passed timestamp to milliseconds
      yyyy = d.getFullYear(),
      mm = ('0' + (d.getMonth() + 1)).slice(-2),//Months are zero based. Add leading 0
      dd = ('0' + d.getDate()).slice(-2), //Add leading 0
      hh = d.getHours(),
      h = hh,
      min = ('0' + d.getMinutes()).slice(-2), //Add leading 0
      ampm = 'AM',
      time;

      if (hh > 12) {
        h = hh - 12
        ampm = 'PM'
      }else if(hh === 12){
        h = 12
        ampm = 'PM'
      } else if(hh == 0){
        h = 12
      }

      time = dd + '/' + mm + '/' + yyyy + ', ' + h + ":" + min + ' ' + ampm

      return time
    }
  },
};
</script>
<style scoped>
.top-navbar {
  top: 0px;
}
</style>
