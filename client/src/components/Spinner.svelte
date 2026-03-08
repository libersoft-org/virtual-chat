<style>
	.spinner {
		margin: 0 auto;
		width: 19px;
		height: 19px;
		border-radius: 50%;
		background:
			radial-gradient(farthest-side, #000 94%, transparent) top/5px 5px no-repeat,
			conic-gradient(transparent 30%, #000);
		-webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0);
		mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0);
		animation: spin 1s infinite linear;
	}

	@keyframes spin {
		100% {
			transform: rotate(1turn);
		}
	}
</style>

<div class="spinner"></div>
