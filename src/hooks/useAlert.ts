import Swal from "sweetalert2";
import withReactContent, { ReactSweetAlertOptions } from "sweetalert2-react-content";

interface AlertOptions extends ReactSweetAlertOptions {
  cb: (value: string) => void;
}

const Alert = withReactContent(Swal).mixin({
  confirmButtonText: "Confirmar",
  padding: "1rem",
  confirmButtonColor: "#2d28c8",

  customClass: {
    popup: "text-sm",
    input: "border-gray-300 text-gray-500 rounded-md h-8 px-2 border border-primary-300",
  },
});

const useAlert = () => {
  const customAlert = ({ cb, ...rest }: AlertOptions) => {
    // @ts-expect-error: showCancelButton is not in the type definition
    Alert.fire({ ...rest, showCancelButton: true }).then((result) => {
      if (result.isConfirmed) {
        cb(result.value);
      }
    });
  };

  return customAlert;
};

export default useAlert;
