import merge from 'deepmerge'

export default function storeData () {
  return store => {
    var localStorageAvailable = function () {
      var supported = true
      try {
        var ls = window.localStorage
        var test = '__hz-ls-test__'
        ls.setItem(test, test)
        ls.removeItem(test)
      } catch (e) {
        supported = false
      }
      return supported
    }
    var lsStorage = false
    var gsStorage = false
    if (localStorageAvailable()) {
      lsStorage = window.localStorage
    }
    gsStorage = window.sessionStorage
    var mainStorage = lsStorage
    if (!mainStorage) {
      mainStorage = gsStorage
    }
    if (mainStorage.getItem('language')) {
      store.commit('change_lang', mainStorage.getItem('language'))
    }
    if (mainStorage.getItem('notify_sound')) {
      store.commit('change_notify_sound', mainStorage.getItem('notify_sound'))
    }
    if (mainStorage.getItem('notify_bar')) {
      store.commit('change_notify_bar', mainStorage.getItem('notify_bar'))
    }
    if (mainStorage.getItem('notify_desktop')) {
      store.commit('change_notify_desktop', mainStorage.getItem('notify_desktop'))
    }
    var storeInLocalStorage = mainStorage.getItem('storeInLocalStorage')
    if (storeInLocalStorage === 'false') {
      storeInLocalStorage = false
    }
    if (storeInLocalStorage) {
      store.commit('change_storage_method', storeInLocalStorage)
    }
    var useStorage = gsStorage
    if (storeInLocalStorage && lsStorage) {
      useStorage = lsStorage
    }
    var value = useStorage.getItem('adm-persist')
    if (value !== 'undefined') {
      if (value) {
        value = JSON.parse(value)
      }
    }
    if (typeof value === 'object' && value !== null) {
      store.replaceState(merge(store.state, value, {
        arrayMerge: function (store, saved) { return saved },
        clone: false
      }))
    }
    window.onbeforeunload = function () {
      window.ep.$store.commit('force_update')
    }
    store.subscribe((mutation, state) => {
      var storeNow = false
      if (mutation.type === 'change_storage_method') {
        if (mutation.payload) {
          useStorage = lsStorage
          try {
            lsStorage.setItem('adm-persist', gsStorage.getItem('adm-persist'))
          } catch (e) {
          }
        } else {
          useStorage = gsStorage
          lsStorage.removeItem('adm-persist')
        }
        try {
          mainStorage.setItem('storeInLocalStorage', mutation.payload)
        } catch (e) {
        }
        storeNow = true
      } else if (mutation.type === 'change_lang') {
        mainStorage.setItem('language', mutation.payload)
        storeNow = true
      } else if (mutation.type === 'change_notify_sound') {
        mainStorage.setItem('notify_sound', mutation.payload)
        storeNow = true
      } else if (mutation.type === 'change_notify_bar') {
        mainStorage.setItem('notify_bar', mutation.payload)
        storeNow = true
      } else if (mutation.type === 'change_notify_desktop') {
        mainStorage.setItem('notify_desktop', mutation.payload)
        storeNow = true
      }
      if (mutation.type === 'logout') {
        storeNow = true
      }
      if (mutation.type === 'save_passphrase') {
        storeNow = true
      }
      if (mutation.type === 'force_update') {
        storeNow = true
      }
      if (mutation.type === 'change_partner_name') {
        storeNow = true
      }
      if (mutation.type === 'leave_chat') {
        storeNow = true
      }
      if (mutation.type === 'ajax_start' || mutation.type === 'ajax_end' || mutation.type === 'ajax_end_with_error' || mutation.type === 'start_tracking_new' || mutation.type === 'have_loaded_chats' || mutation.type === 'connect' || mutation.type === 'login') {
        return
      }
      if (storeNow) {
        try {
          useStorage.setItem('adm-persist', JSON.stringify(state))
        } catch (e) {
        }
      } else {
        if (window.storeTimer) {
          window.clearTimeout(window.storeTimer)
        }
        var storeTimer = window.setTimeout(function () {
          window.ep.$store.commit('force_update')
          window.storeTimer = undefined
        }, 10000)
        window.storeTimer = storeTimer
      }
    })
  }
}
