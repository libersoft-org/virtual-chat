<script lang="ts">
 const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white'];

 let { onenter }: { onenter: (name: string, sex: boolean | null, color: number) => void } = $props();

 let name = $state('');
 let sex = $state('');
 let color = $state(1);
 let loading = $state(false);

 function setColor(id: number) {
  color = id;
 }

 function enter() {
  if (loading) return;
  loading = true;
  let sexValue: boolean | null = sex === '1' ? true : sex === '0' ? false : null;
  onenter(name, sexValue, color);
 }
</script>

<div id="login" class="form">
 <div class="logo">Virtual Chat</div>
 <input type="text" placeholder="Nickname" bind:value={name} />
 <select bind:value={sex}>
  <option value="" selected>-- Gender --</option>
  <option value="1">Male</option>
  <option value="0">Female</option>
 </select>
 <div class="color-picker">
  {#each colors as c, i}
   <button
    type="button"
    class="color {c}"
    class:active={color === i + 1}
    onclick={() => setColor(i + 1)}
    aria-label="Color {c}"
   ></button>
  {/each}
 </div>
 <button id="enter" class="button" class:orange={!loading} class:gray={loading} onclick={enter}>
  {#if loading}
   <div class="loader"></div>
  {:else}
   Enter
  {/if}
 </button>
</div>
