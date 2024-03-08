import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface AlertOptions {
  title?: string;
  text?: string;
  input?: string;
  inputLabel?: string;
  cb: (value: string) => void;
}

const useAlert = () => {
  const customAlert = ({ title, text, input, cb, inputLabel }: AlertOptions) => {
    MySwal.mixin({
      confirmButtonText: "Confirmar",
      customClass: {
        confirmButton: "!bg-primary-600 text-white",
      },
    })
      .fire({
        input,
        inputLabel,
        title,
        text,
        showCancelButton: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          cb(result.value);
        }
      });
  };

  return customAlert;
};

export default useAlert;
