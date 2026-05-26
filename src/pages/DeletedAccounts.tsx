import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type DeletedUser = {
  backupId: string;
  deletedUserId: string;
  name: string;
  email: string;
  mobile: string;
  totalServices: number;
  totalBookings: number;
  totalPayments: number;
  deletedAt: string;
};

const DeletedAccounts = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  // .env
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

  const fetchDeletedUsers =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "adminToken"
          );

        const res =
          await axios.get(
            `${BASE_URL}/api/account/deleted-users`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (
          res.data.success
        ) {
          setDeletedUsers(
            res.data.data ||
              []
          );

          setTotal(
            res.data.total ||
              0
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Deleted accounts error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Deleted
          Accounts
        </h1>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  Name
                </th>

                <th className="px-4 py-3 text-left">
                  Email
                </th>

                <th className="px-4 py-3 text-left">
                  Mobile
                </th>

                <th className="px-4 py-3 text-center">
                  Services
                </th>

                <th className="px-4 py-3 text-center">
                  Bookings
                </th>

                <th className="px-4 py-3 text-center">
                  Payments
                </th>

                <th className="px-4 py-3 text-left">
                  Deleted At
                </th>

                <th className="px-4 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : deletedUsers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center"
                  >
                    No deleted
                    accounts
                    found
                  </td>
                </tr>
              ) : (
                deletedUsers.map(
                  (
                    user
                  ) => (
                    <tr
                      key={
                        user.backupId
                      }
                      className="border-t"
                    >
                      <td className="px-4 py-4">
                        {
                          user.name
                        }
                      </td>

                      <td className="px-4 py-4">
                        {
                          user.email
                        }
                      </td>

                      <td className="px-4 py-4">
                        {
                          user.mobile
                        }
                      </td>

                      <td className="px-4 py-4 text-center">
                        {
                          user.totalServices
                        }
                      </td>

                      <td className="px-4 py-4 text-center">
                        {
                          user.totalBookings
                        }
                      </td>

                      <td className="px-4 py-4 text-center">
                        {
                          user.totalPayments
                        }
                      </td>

                      <td className="px-4 py-4">
                        {new Date(
                          user.deletedAt
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/deleted-accounts/${user.backupId}`
                            )
                          }
                          className="rounded-lg bg-black px-4 py-2 text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {total > limit && (
          <div className="flex items-center justify-between border-t p-4">
            <button
              disabled={
                page ===
                1
              }
              onClick={() =>
                setPage(
                  (
                    prev
                  ) =>
                    prev -
                    1
                )
              }
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page{" "}
              {page}
            </span>

            <button
              disabled={
                page *
                  limit >=
                total
              }
              onClick={() =>
                setPage(
                  (
                    prev
                  ) =>
                    prev +
                    1
                )
              }
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletedAccounts;