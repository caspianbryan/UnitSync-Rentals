"use client";

export default function DevRoleSwitcher() {

  const setRole = (role) => {
    localStorage.setItem("dev-role", role);
    window.location.reload();
  };

  return (
    <div style={{position:"fixed",bottom:20,right:20}}>
      <button onClick={()=>setRole("admin")}>Admin</button>
      <button onClick={()=>setRole("tenant")}>Tenant</button>
      <button onClick={()=>setRole("")}>Real Role</button>
    </div>
  );
}
