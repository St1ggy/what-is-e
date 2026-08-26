<script lang="ts">
  import { X } from '@lucide/svelte'

  import * as m from '@/paraglide/messages'

  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    open: boolean
    title: string
  }

  let { children, open = $bindable(), title }: Props = $props()
  let dialog: HTMLDialogElement

  $effect(() => {
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()

    if (!open && dialog.open) dialog.close()
  })

  function close() {
    open = false
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === dialog) close()
  }
</script>

<dialog
  bind:this={dialog}
  class="ui-modal"
  aria-labelledby="additive-modal-title"
  onclick={handleBackdropClick}
  onclose={close}
>
  <h2 id="additive-modal-title" class="visually-hidden">{title}</h2>
  <button class="ui-modal-close" type="button" aria-label={m.close()} onclick={close}>
    <X size={20} aria-hidden="true" />
  </button>
  <div class="ui-modal-content">
    {@render children()}
  </div>
</dialog>

<style>
  .ui-modal {
    width: min(1180px, calc(100vw - 28px));
    max-width: none;
    max-height: calc(100dvh - 32px);
    overflow: hidden;
    padding: 0;
    border: 1px solid var(--line-strong);
    border-radius: 14px;
    color: var(--ink);
    background: var(--paper);
    box-shadow: 0 40px 110px rgb(5 7 12 / 46%);
  }

  .ui-modal[open] {
    animation: modal-enter 240ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .ui-modal::backdrop {
    background: rgb(8 10 14 / 72%);
    backdrop-filter: blur(6px);
    animation: backdrop-enter 200ms ease both;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .ui-modal-close {
    position: absolute;
    z-index: 10;
    top: 16px;
    right: 16px;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 9px;
    font: inherit;
    line-height: 1;
    color: var(--ink);
    background: var(--white);
    box-shadow: var(--shadow-soft);
    cursor: pointer;
  }

  .ui-modal-close:hover {
    color: #fff;
    background: var(--accent);
  }

  .ui-modal-close:focus-visible {
    outline: 3px solid rgb(63 114 104 / 35%);
    outline-offset: 2px;
  }

  .ui-modal-content {
    max-height: calc(100dvh - 32px);
    overflow: auto;
  }

  @media (max-width: 620px) {
    .ui-modal {
      width: 100vw;
      max-height: 100dvh;
      margin: auto 0 0;
      border-radius: 18px 18px 0 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-modal[open],
    .ui-modal::backdrop {
      animation: none;
    }
  }

  @keyframes modal-enter {
    from {
      transform: translateY(16px) scale(0.985);
      opacity: 0;
    }

    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes backdrop-enter {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
</style>
