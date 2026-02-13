/**
 * Admin registration page.
 * Validates registration input, creates account, and redirects to login after success.
 */
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { api } from "../../lib/api";
import { setAuthUser, setToken } from "../../lib/auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "super_admin"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await api.auth.register(values);
      setToken(response.token);
      setAuthUser(response.user);
      toast.success("Account created successfully");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Register failed");
    }
  };

  return (
    <div className="page-auth">
      <div className="auth-card">
        <h1 className="auth-card__title">Admin Register</h1>
        <p className="auth-card__subtitle">Create an admin account to access the dashboard.</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <label className="field">
            <span className="field__label">Role</span>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" value="admin" {...register("role")} />
                <span>Admin</span>
              </label>
              <label className="radio-option">
                <input type="radio" value="super_admin" {...register("role")} />
                <span>Super Admin</span>
              </label>
            </div>
          </label>

          <Button type="submit" loading={isSubmitting} fullWidth>
            Register
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link className="auth-link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
