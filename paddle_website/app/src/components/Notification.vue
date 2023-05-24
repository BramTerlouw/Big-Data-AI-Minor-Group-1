<script>
export default {
    props: ["status", "message"],
    methods: {
        getStatus() {
            if (this.status == 'succes') {
                return 'Succesfull'
            }
            else if (this.status == 'danger') {
                return 'Error'
            }
            else if (this.status == 'info') {
                return 'Info'
            }
            else {
                return 'Warning'
            }
        },
    }
};
</script>

<template>
  <div class="wrapper" 
    :class="{ 
        'wrapper-succes': status == 'succes', 
        'wrapper-danger': status == 'danger',
        'wrapper-info': status == 'info',
        'wrapper-warning': status == 'warning' }">
    <p class="message">{{ message }}</p>
    <div class="status-wrapper">
      <span class="status" 
        :class="{ 
            'status-succes': status == 'succes', 
            'status-danger': status == 'danger',
            'status-info': status == 'info',
            'status-warning': status == 'warning' }">{{ getStatus() }}
      </span>

      <svg v-if="status == 'succes'" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11.5" cy="11.5" r="10.5" fill="#00A825" stroke="#00A825" stroke-width="2"/>
        <path d="M6.83913 11.9327L9.80762 15.8706L16.3227 6.37966" stroke="white" stroke-width="2.3" stroke-linecap="round"/>
      </svg>

      <svg v-if="status == 'danger'" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="12" r="12" fill="#BA0000"/>
        <path d="M20 6L8 18" stroke="white" stroke-width="2"/>
        <path d="M8 6L20 18" stroke="white" stroke-width="2"/>
      </svg>

      <svg v-if="status == 'info'" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.35 17.25H12.65V10.35H10.35V17.25ZM11.5 8.05C11.8258 8.05 12.0991 7.9396 12.3199 7.7188C12.5407 7.498 12.6508 7.22507 12.65 6.9C12.65 6.57417 12.5396 6.30085 12.3188 6.08005C12.098 5.85925 11.8251 5.74923 11.5 5.75C11.1742 5.75 10.9008 5.8604 10.68 6.0812C10.4592 6.302 10.3492 6.57493 10.35 6.9C10.35 7.22583 10.4604 7.49915 10.6812 7.71995C10.902 7.94075 11.1749 8.05077 11.5 8.05ZM11.5 23C9.90917 23 8.41417 22.6979 7.015 22.0938C5.61583 21.4897 4.39875 20.6705 3.36375 19.6362C2.32875 18.6012 1.50957 17.3842 0.9062 15.985C0.302833 14.5858 0.000766667 13.0908 0 11.5C0 9.90917 0.302067 8.41417 0.9062 7.015C1.51033 5.61583 2.32952 4.39875 3.36375 3.36375C4.39875 2.32875 5.61583 1.50957 7.015 0.9062C8.41417 0.302833 9.90917 0.000766667 11.5 0C13.0908 0 14.5858 0.302067 15.985 0.9062C17.3842 1.51033 18.6012 2.32952 19.6362 3.36375C20.6712 4.39875 21.4908 5.61583 22.0949 7.015C22.6991 8.41417 23.0008 9.90917 23 11.5C23 13.0908 22.6979 14.5858 22.0938 15.985C21.4897 17.3842 20.6705 18.6012 19.6362 19.6362C18.6012 20.6712 17.3842 21.4908 15.985 22.0949C14.5858 22.6991 13.0908 23.0008 11.5 23ZM11.5 20.7C14.0683 20.7 16.2437 19.8087 18.0262 18.0262C19.8087 16.2437 20.7 14.0683 20.7 11.5C20.7 8.93167 19.8087 6.75625 18.0262 4.97375C16.2437 3.19125 14.0683 2.3 11.5 2.3C8.93167 2.3 6.75625 3.19125 4.97375 4.97375C3.19125 6.75625 2.3 8.93167 2.3 11.5C2.3 14.0683 3.19125 16.2437 4.97375 18.0262C6.75625 19.8087 8.93167 20.7 11.5 20.7Z" fill="#3e84e5"/>
      </svg>

      <svg v-if="status == 'warning'" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 23L11.5 0L23 23H0ZM3.60682 20.5789H19.3932L11.5 4.84211L3.60682 20.5789ZM11.5 19.3684C11.7962 19.3684 12.0447 19.2522 12.2454 19.0198C12.4461 18.7874 12.5462 18.5001 12.5455 18.1579C12.5455 17.8149 12.4451 17.5272 12.2444 17.2948C12.0436 17.0624 11.7955 16.9466 11.5 16.9474C11.2038 16.9474 10.9553 17.0636 10.7546 17.296C10.5539 17.5284 10.4538 17.8157 10.4545 18.1579C10.4545 18.5009 10.5549 18.7886 10.7556 19.021C10.9564 19.2534 11.2045 19.3692 11.5 19.3684ZM10.4545 15.7368H12.5455V9.68421H10.4545V15.7368Z" fill="#e7a029"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
    .wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;

        padding: 12px 15px;
        
        border-radius: 10px;
        box-shadow: 0 3px 5px rgb(0 0 0 / 0.2);
    }

    .wrapper-succes {
        background-color: #DCECDF;
        border-left: 10px solid #00A825;
    }

    .wrapper-danger {
        background-color: #EEDCDC;
        border-left: 10px solid #BA0000;
    }

    .wrapper-warning {
        background-color: #ffe8c3;
        border-left: 10px solid #e7a029;
    }

    .wrapper-info {
        background-color: #cce3ff;
        border-left: 10px solid #3e84e5;
    }

    .message {
        margin: 0;
        font-weight: 500;
    }

    .status-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .status {
        font-style: italic;
    }

    .status-succes {
        color: #00A825;
    }

    .status-danger {
        color: #BA0000;
    }

    .status-warning {
        color: #e7a029;
    }

    .status-info {
        color: #3e84e5;
    }
</style>
