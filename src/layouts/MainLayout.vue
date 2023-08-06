<template>
    <div>
        <NavBar
            :app_name="app_name"
        />
        <slot></slot>
        <Footer/>
    </div>
</template>

<script>
    import NavBar from '@/components/NavBar.vue'
    import Footer from '@/components/Footer.vue'
    export default {
        name: 'MainLayout',
        components: {
            NavBar,
            Footer
        },
        data () {
            return {
                app_name : process.env.VUE_APP_TITLE ?? 'WEATHER APPLICATION',
            }
        }
    }

</script>