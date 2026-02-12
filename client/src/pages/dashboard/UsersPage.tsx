/**
 * Admins management page.
 * Displays admins with search/sort/pagination and supports deactivation actions.
 */

import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { api, ApiError } from "../../lib/api";
import { clearToken, getAuthUser } from "../../lib/auth";
import { useDebounce } from "../../hooks/useDebounce";
import type { PaginatedResponse, User } from "../../types/api";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5h16v14H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 2v4M16 2v4M3 10h18" />
      <rect x="3" y="4" width="18" height="17" rx="2" />
    </svg>
  );
}

function SortIcon({ order }: { order: "asc" | "desc" }) {
  return order === "asc" ? (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 18V6" />
      <path d="m7 11 5-5 5 5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 6v12" />
      <path d="m17 13-5 5-5-5" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4h4" />
    </svg>
  );
}

export function UsersPage() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const debouncedQuery = useDebounce(query, 250);
  const isSuperAdmin = user?.role === "super_admin";
  const hasData = Boolean(data && data.data.length);

  const queryParams = useMemo(
    () => ({ page, limit, sort, order, q: debouncedQuery }),
    [page, limit, sort, order, debouncedQuery]
  );

  useEffect(() => {
    if (!isSuperAdmin) {
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await api.users.list(queryParams);
        setData(response);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearToken();
          navigate("/login", { replace: true });
          return;
        }
        toast.error(error instanceof Error ? error.message : "Failed to load admins");
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, [navigate, queryParams, isSuperAdmin]);

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard/authors" replace />;
  }

  const resetFilters = () => {
    setPage(1);
    setQuery("");
    setSort("createdAt");
    setOrder("desc");
    setLimit(10);
  };

  const onDeactivate = async () => {
    if (!selectedUser) return;

    try {
      await api.users.deactivate(selectedUser._id);
      setSelectedUser(null);
      toast.success("Admin deactivated");
      setData((prev) => {
        if (!prev) return prev;
        const nextData = prev.data.filter((admin) => admin._id !== selectedUser._id);
        const total = Math.max(prev.total - 1, 0);
        return {
          ...prev,
          data: nextData,
          total,
          results: nextData.length,
          totalPages: Math.max(Math.ceil(total / prev.limit), 1),
        };
      });
      if (data && data.page > 1 && data.data.length === 1) {
        setPage((prevPage) => Math.max(prevPage - 1, 1));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate admin");
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Admins</h1>
          <p className="page-header__subtitle">Manage active admins and deactivate accounts.</p>
        </div>
      </div>

      <div className="filters-mobile-trigger">
        <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
          <span className="btn__icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5h18" />
              <path d="M6 12h12" />
              <path d="M10 19h4" />
            </svg>
          </span>
          <span>Filter</span>
        </Button>
      </div>

      <div className="filters-desktop">
        <div className="card filters-grid filters-grid--5">
          <Input
            label="Search"
            placeholder="Search by name/email"
            className="field__control--icon-search"
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
          />

          <Select
            label="Sort by"
            value={sort}
            onChange={(event) => {
              setPage(1);
              setSort(event.target.value);
            }}
          >
            <option value="createdAt">Created Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </Select>

          <label className="field">
            <span className="field__label">Order</span>
            <button
              type="button"
              className="order-toggle-btn"
              onClick={() => {
                setPage(1);
                setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              }}
            >
              <SortIcon order={order} />
              <span>{order === "asc" ? "Asc" : "Desc"}</span>
            </button>
          </label>

          <Select
            label="Per page"
            value={String(limit)}
            onChange={(event) => {
              setPage(1);
              setLimit(Number(event.target.value));
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </Select>

          <label className="field">
            <span className="field__label">Actions</span>
            <Button variant="secondary" onClick={resetFilters}>
              <span className="btn__icon">
                <ResetIcon />
              </span>
              <span>Clear Filters</span>
            </Button>
          </label>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen ? (
          <motion.div
            className="sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              className="sheet-card"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sheet-header">
                <h3>Filters</h3>
                <button className="sheet-close" onClick={() => setFiltersOpen(false)} type="button">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6l-12 12" />
                  </svg>
                </button>
              </div>

              <div className="sheet-body">
                <div className="filters-grid filters-grid--5">
                  <Input
                    label="Search"
                    placeholder="Search by name/email"
                    className="field__control--icon-search"
                    value={query}
                    onChange={(event) => {
                      setPage(1);
                      setQuery(event.target.value);
                    }}
                  />

                  <Select
                    label="Sort by"
                    value={sort}
                    onChange={(event) => {
                      setPage(1);
                      setSort(event.target.value);
                    }}
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                  </Select>

                  <label className="field">
                    <span className="field__label">Order</span>
                    <button
                      type="button"
                      className="order-toggle-btn"
                      onClick={() => {
                        setPage(1);
                        setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                      }}
                    >
                      <SortIcon order={order} />
                      <span>{order === "asc" ? "Asc" : "Desc"}</span>
                    </button>
                  </label>

                  <Select
                    label="Per page"
                    value={String(limit)}
                    onChange={(event) => {
                      setPage(1);
                      setLimit(Number(event.target.value));
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </Select>
                </div>
              </div>

              <div className="sheet-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetFilters();
                  }}
                >
                  Reset
                </Button>
                <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="card list-card">
        {loading && hasData ? (
          <div className="list-loading">
            <span className="spinner__dot" />
            <span>Updating admins...</span>
          </div>
        ) : null}
        <AnimatePresence mode="wait">
          {loading && !hasData ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Spinner label="Loading admins..." />
            </motion.div>
          ) : data && data.data.length ? (
            <motion.div key={`users-${data.page}-${data.results}-${sort}-${order}-${debouncedQuery}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="desktop-only">
                <Table headers={["Name", "Email", "Role", "Created", "Actions"]}>
                  {data.data.map((admin) => (
                    <tr key={admin._id}>
                      <td className="table-cell-strong">{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.role}</td>
                      <td>{formatDate(admin.createdAt)}</td>
                      <td>
                        <Button variant="danger" onClick={() => setSelectedUser(admin)}>
                          Deactivate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>

              <div className="mobile-only mobile-cards">
                {data.data.map((admin) => (
                  <article key={admin._id} className="mobile-profile-card">
                    <div className="mobile-profile-card__header">
                      <h3 className="mobile-profile-card__title">{admin.name}</h3>
                      <p className="mobile-profile-card__subtext">{admin.role}</p>
                    </div>

                    <div className="mobile-profile-card__meta">
                      <p className="mobile-profile-card__meta-item">
                        <span className="mobile-profile-card__meta-icon">
                          <MailIcon />
                        </span>
                        <span>{admin.email}</span>
                      </p>
                      <p className="mobile-profile-card__meta-item">
                        <span className="mobile-profile-card__meta-icon">
                          <CalendarIcon />
                        </span>
                        <span>Joined {formatDate(admin.createdAt)}</span>
                      </p>
                    </div>

                    <div className="mobile-profile-card__actions">
                      <Button variant="danger" fullWidth onClick={() => setSelectedUser(admin)}>
                        Deactivate
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <EmptyState title="No admins found" description="Try changing filters or search keywords." />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {data ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onPageChange={(nextPage) => setPage(nextPage)}
          disabled={loading}
        />
      ) : null}

      <Modal
        open={Boolean(selectedUser)}
        title="Deactivate admin"
        onClose={() => setSelectedUser(null)}
        showClose={false}
      >
        <div className="form-stack">
          <p className="info-text">
            Are you sure you want to deactivate <span className="text-strong">{selectedUser?.email}</span>?
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDeactivate}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
