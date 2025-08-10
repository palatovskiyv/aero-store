<script setup>
import SocialButtons from '~/components/ui/SocialButtons.vue'
import { saveUtmFromUrl } from '@/utils/cookies'

// Сохраняем utm-метки при загрузке любой страницы
onMounted(() => {
  saveUtmFromUrl()
})

useHead({
  script: [
    {
      innerHTML: `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  ym(101721101, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
  }
);
      `,
      type: 'text/javascript',
    },
    {
      innerHTML: `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  ym(102411807, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
  }
);
      `,
      type: 'text/javascript',
    },
  ],
  noscript: [
    {
      innerHTML: `<div><img src="https://mc.yandex.ru/watch/101721101" style="position:absolute; left:-9999px;" alt="" /></div>`,
    },
    {
      innerHTML: `<div><img src="https://mc.yandex.ru/watch/102411807" style="position:absolute; left:-9999px;" alt="" /></div>`,
    },
  ],
})
</script>

<template>
  <UiHeader />
  <NuxtPage />
  <UiFooter />
  <SocialButtons />
</template>
