import useDialogStore from "@/store/useDialogStore";

const useDialog = () => useDialogStore((state) => state.dialog);

export default useDialog;
