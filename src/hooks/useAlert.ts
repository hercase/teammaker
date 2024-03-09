import Swal from "sweetalert2";
import withReactContent, { ReactSweetAlertOptions } from "sweetalert2-react-content";

interface AlertOptions {
  title?: string;
  text?: string;
  input?: ReactSweetAlertOptions["input"];
  inputLabel?: string;
  cb: (value: string) => void;
}

const useAlert = () => {
  const Alert = withReactContent(Swal).mixin({
    confirmButtonText: "Confirmar",
    padding: "1rem",
    confirmButtonColor: "#2d28c8",

    customClass: {
      confirmButton: "!bg-primary-800 text-white",
    },
  });

  const customAlert = ({ title, text, input, cb, inputLabel }: AlertOptions) => {
    Alert.fire({
      input,
      inputLabel,
      title,
      text,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        cb(result.value);
      }
    });
  };

  return customAlert;
};

export default useAlert;
