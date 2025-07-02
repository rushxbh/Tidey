// Example: RegisterUser.tsx
import React, { useState } from "react";
import { useTideyWrite } from "../hooks/useTIdey";

export default function RegisterUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const { registerVolunteer, isPending, error } = useTideyWrite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerVolunteer(name, email, mobile);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="Mobile"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        required
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "Registering..." : "Register"}
      </button>
      {error && <div style={{ color: "red" }}>{error.message}</div>}
    </form>
  );
}
