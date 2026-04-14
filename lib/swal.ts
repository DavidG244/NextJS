import Swal from "sweetalert2";

// Configurar SweetAlert2 con tema oscuro compatible con DaisyUI
const darkSwal = Swal.mixin({
  background: "#1f2937", // bg-base-200
  color: "#f9fafb", // text-base-content
  buttonsStyling: false,
  customClass: {
    popup: "rounded-3xl border border-base-300 shadow-xl",
    title: "text-xl font-semibold text-base-content",
    htmlContainer: "text-sm text-base-content",
    confirmButton: "btn btn-primary btn-md w-full sm:w-auto",
    cancelButton: "btn btn-outline btn-sm",
    denyButton: "btn btn-error btn-sm",
    actions: "flex flex-col gap-2 sm:flex-row sm:justify-end",
    input: "input input-bordered bg-base-200 text-base-content",
    inputLabel: "label text-base-content",
  },
});

export default darkSwal;