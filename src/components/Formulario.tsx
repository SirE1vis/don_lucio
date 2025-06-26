// ContactForm.tsx
import { useState, useCallback, useEffect } from "preact/hooks";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

enum SubmissionStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  phone: /^[0-9]+$/,
} as const;

const ERROR_MESSAGES = {
  required: {
    firstName: "El nombre es requerido",
    lastName: "El apellido es requerido",
    phone: "El número de celular es requerido",
    email: "El email es requerido",
    message: "El mensaje es requerido",
  },
  invalid: {
    firstName: "El nombre solo debe contener letras",
    lastName: "El apellido solo debe contener letras",
    phone: "El número debe contener solo dígitos",
    email: "Por favor ingresa un email válido",
  },
  minLength: {
    phone: "El número debe tener al menos 9 dígitos",
    message: "El mensaje debe tener al menos 10 caracteres",
  },
} as const;

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);

  const validateField = (
    field: keyof FormData,
    value: string
  ): string | undefined => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return ERROR_MESSAGES.required[field];

    switch (field) {
      case "firstName":
      case "lastName":
        return !VALIDATION_RULES.text.test(value)
          ? ERROR_MESSAGES.invalid[field]
          : undefined;
      case "phone":
        if (!VALIDATION_RULES.phone.test(value))
          return ERROR_MESSAGES.invalid.phone;
        return value.length < 9 ? ERROR_MESSAGES.minLength.phone : undefined;
      case "email":
        return !VALIDATION_RULES.email.test(value)
          ? ERROR_MESSAGES.invalid.email
          : undefined;
      case "message":
        return value.length < 10 ? ERROR_MESSAGES.minLength.message : undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const isValidInput = (field: keyof FormData, value: string): boolean => {
    if (field === "firstName" || field === "lastName") {
      return VALIDATION_RULES.text.test(value) || value === "";
    }
    if (field === "phone") {
      return VALIDATION_RULES.phone.test(value) || value === "";
    }
    return true;
  };

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      if (!isValidInput(field, value)) return;

      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStatus(SubmissionStatus.LOADING);

    try {
      const netlifyFormData = new FormData();
      netlifyFormData.append("form-name", "contact");
      netlifyFormData.append("first-name", formData.firstName);
      netlifyFormData.append("last-name", formData.lastName);
      netlifyFormData.append("phone", formData.phone);
      netlifyFormData.append("email", formData.email);
      netlifyFormData.append("message", formData.message);

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(netlifyFormData as any).toString(),
      });

      if (response.ok) {
        setStatus(SubmissionStatus.SUCCESS);
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          message: "",
        });
      } else {
        throw new Error("Error en el servidor");
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      setStatus(SubmissionStatus.ERROR);
    }
  };

  const resetStatus = () => setStatus(SubmissionStatus.IDLE);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (
      status === SubmissionStatus.SUCCESS ||
      status === SubmissionStatus.ERROR
    ) {
      const timer = setTimeout(() => {
        setStatus(SubmissionStatus.IDLE);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  const renderInput = (
    field: keyof FormData,
    label: string,
    type: string = "text",
    placeholder: string,
    autocomplete?: string
  ) => (
    <div>
      <label
        htmlFor={field}
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={field}
        name={
          field === "firstName"
            ? "first-name"
            : field === "lastName"
            ? "last-name"
            : field
        }
        value={formData[field]}
        onInput={(e) =>
          handleInputChange(field, (e.target as HTMLInputElement).value)
        }
        disabled={status === SubmissionStatus.LOADING}
        class={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-amber-600/75 focus:border-transparent transition-colors text-sm ${
          errors[field] ? "border-red-300" : "border-gray-300"
        } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        placeholder={placeholder}
        autocomplete={autocomplete}
      />
      {errors[field] && (
        <p class="mt-1 text-sm text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  const NotificationMessage = ({ type }: { type: "success" | "error" }) => {
    const isSuccess = type === "success";
    const bgColor = isSuccess
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";
    const iconColor = isSuccess ? "text-green-400" : "text-red-400";
    const textColor = isSuccess ? "text-green-800" : "text-red-800";
    const hoverColor = isSuccess
      ? "hover:text-green-600"
      : "hover:text-red-600";
    const message = isSuccess
      ? "¡Mensaje enviado con éxito! Te responderemos pronto."
      : "Error al enviar el mensaje. Por favor, inténtalo de nuevo.";

    const iconPath = isSuccess
      ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z";

    return (
      <div
        class={`fixed bottom-52 right-4 max-w-sm p-4 ${bgColor} border rounded-lg shadow-lg z-50 animate-pulse`}
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg
              class={`h-5 w-5 ${iconColor}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d={iconPath} clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div class="ml-auto pl-3">
            <button
              type="button"
              onClick={resetStatus}
              class={`inline-flex ${iconColor} ${hoverColor}`}
            >
              <span class="sr-only">Cerrar</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class="relative">
      <form
        onSubmit={handleSubmit}
        name="contact"
        method="POST"
        data-netlify="true"
        class="space-y-6"
      >
        <input type="hidden" name="form-name" value="contact" />

        <div class="grid sm:grid-cols-2 gap-4 text-black/50 text-base">
          {renderInput(
            "firstName",
            "Nombres",
            "text",
            "Ingresa tu nombre",
            "given-name"
          )}
          {renderInput(
            "lastName",
            "Apellidos",
            "text",
            "Ingresa tu apellido",
            "family-name"
          )}
        </div>

        <div class="grid sm:grid-cols-2 gap-4 text-black/50 text-[10px]">
          {renderInput("phone", "Número de celular", "tel", "987 872 231", "tel")}
          {renderInput("email", "Email", "email", "migmail@gmal.com", "email")}
        </div>

        <div>
          <label
            htmlFor="message"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onInput={(e) =>
              handleInputChange(
                "message",
                (e.target as HTMLTextAreaElement).value
              )
            }
            disabled={status === SubmissionStatus.LOADING}
            class={`w-full px-4 py-3 border rounded-lg focus:ring-1 text-black/50 text-sm focus:ring-amber-600/75 focus:border-transparent transition-colors resize-none overflow-y-auto ${
              errors.message ? "border-red-300" : "border-gray-300"
            } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            placeholder="Escribe tu mensaje aquí..."
          />
          {errors.message && (
            <p class="mt-1 text-base text-red-600">{errors.message}</p>
          )}
        </div>

        <div class="flex justify-center">
          <button
            type="submit"
            disabled={status === SubmissionStatus.LOADING}
            class="w-3/4 border-2 bg-amber-500/90 font-rocket text-base md:text-lg text-black text__glowing hover:bg-amber-600 py-3 px-6 rounded-lg  focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black/25"
          >
            {status === SubmissionStatus.LOADING ? (
              <div class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Enviando...
              </div>
            ) : (
              "Enviar mensaje"
            )}
          </button>
        </div>
      </form>

      {status === SubmissionStatus.SUCCESS && (
        <NotificationMessage type="success" />
      )}
      {status === SubmissionStatus.ERROR && (
        <NotificationMessage type="error" />
      )}
    </div>
  );
};

export default ContactForm;
