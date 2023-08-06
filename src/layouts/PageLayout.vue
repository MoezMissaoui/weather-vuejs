<template>
    <div>
        <PageNavBar
            :app_name="app_name"
        />
        <slot></slot>
        <Footer/>
    </div>
</template>

<script>
    import PageNavBar from '@/components/PageNavBar.vue'
    import Footer from '@/components/Footer.vue'
    export default {
        name: 'PageLayout',
        components: {
            PageNavBar,
            Footer
        },
        data () {
            return {
                app_name : process.env.VUE_APP_TITLE ?? 'WEATHER APPLICATION',
            }
        }
    }

</script>