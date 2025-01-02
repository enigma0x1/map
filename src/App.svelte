<script>
  import WorldOrganizations from '$lib/components/WorldOrganizations.svelte';
  // ... mevcut scriptiniz devam etsin
</script>

<main>
  <WorldOrganizations />
  
  <!-- mevcut popup ve diğer özellikleriniz devam etsin -->
  {#if selectedCountry}
    <div class="popup" transition:slide>
      <!-- ... -->
    </div>
  {/if}
</main>

<!-- mevcut style'ınız devam etsin -->
