import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AdminApiError,
  getPendingReports,
  rejectReport,
  verifyReport,
} from "../../services/adminService";

import type {
  PendingReport,
} from "../../services/adminService";

import "./Admin.css";

export default function AdminReportsPage() {
  const navigate =
    useNavigate();

  const [
    reports,
    setReports,
  ] = useState<
    PendingReport[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionId,
    setActionId,
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  const [
    confidence,
    setConfidence,
  ] = useState<
    Record<number, number>
  >({});

  const applyReports =
    useCallback(
      (
        data: PendingReport[]
      ) => {
        setReports(data);

        setConfidence(
          (current) =>
            Object.fromEntries(
              data.map(
                (report) => [
                  report.id,
                  current[
                    report.id
                  ] ?? 80,
                ]
              )
            )
        );
      },
      []
    );

  const handleLoadError =
    useCallback(
      (
        loadError: unknown
      ) => {
        if (
          loadError instanceof
            AdminApiError &&
          loadError.status === 401
        ) {
          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load reports."
        );
      },
      [navigate]
    );

  const refreshReports =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
          const data =
            await getPendingReports();

          applyReports(data);
        } catch (loadError) {
          handleLoadError(
            loadError
          );
        } finally {
          setLoading(false);
        }
      },
      [
        applyReports,
        handleLoadError,
      ]
    );

  useEffect(() => {
    let cancelled =
      false;

    async function loadInitialReports() {
      try {
        const data =
          await getPendingReports();

        if (cancelled) {
          return;
        }

        applyReports(data);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        handleLoadError(
          loadError
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialReports();

    return () => {
      cancelled = true;
    };
  }, [
    applyReports,
    handleLoadError,
  ]);

  async function handleVerify(
    reportId: number
  ) {
    const value =
      confidence[reportId] ??
      80;

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    ) {
      setError(
        "Confidence must be between 0 and 100."
      );

      return;
    }

    setActionId(
      reportId
    );

    setError(null);
    setSuccess(null);

    try {
      await verifyReport(
        reportId,
        value
      );

      setReports(
        (current) =>
          current.filter(
            (report) =>
              report.id !==
              reportId
          )
      );

      setConfidence(
        (current) => {
          const next = {
            ...current,
          };

          delete next[
            reportId
          ];

          return next;
        }
      );

      setSuccess(
        `Report #${reportId} verified successfully.`
      );
    } catch (verifyError) {
      if (
        verifyError instanceof
          AdminApiError &&
        verifyError.status === 401
      ) {
        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );

        return;
      }

      setError(
        verifyError instanceof
          Error
          ? verifyError.message
          : "Unable to verify report."
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(
    reportId: number
  ) {
    const confirmed =
      window.confirm(
        `Reject report #${reportId}?`
      );

    if (!confirmed) {
      return;
    }

    setActionId(
      reportId
    );

    setError(null);
    setSuccess(null);

    try {
      await rejectReport(
        reportId
      );

      setReports(
        (current) =>
          current.filter(
            (report) =>
              report.id !==
              reportId
          )
      );

      setConfidence(
        (current) => {
          const next = {
            ...current,
          };

          delete next[
            reportId
          ];

          return next;
        }
      );

      setSuccess(
        `Report #${reportId} rejected.`
      );
    } catch (rejectError) {
      if (
        rejectError instanceof
          AdminApiError &&
        rejectError.status === 401
      ) {
        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );

        return;
      }

      setError(
        rejectError instanceof
          Error
          ? rejectError.message
          : "Unable to reject report."
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-reports-header">
        <div>
          <span className="admin-eyebrow">
            Hazard Verification
          </span>

          <h1>
            Pending Reports
          </h1>

          <p>
            Verify only reports that
            contain sufficient,
            credible information.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          disabled={loading}
          onClick={() =>
            void refreshReports()
          }
        >
          <RefreshCw
            size={16}
          />

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success">
          {success}
        </div>
      )}

      {loading ? (
        <div className="admin-empty">
          Loading reports...
        </div>
      ) : reports.length ===
        0 ? (
        <div className="admin-empty">
          <CheckCircle2
            size={35}
          />

          <strong>
            No pending reports
          </strong>

          <span>
            All submitted hazard
            reports have been
            reviewed.
          </span>
        </div>
      ) : (
        <div className="admin-report-list">
          {reports.map(
            (report) => {
              const isProcessing =
                actionId ===
                report.id;

              return (
                <article
                  key={
                    report.id
                  }
                  className="admin-report-card"
                >
                  <div className="admin-report-top">
                    <div>
                      <span className="admin-report-id">
                        Report #
                        {
                          report.id
                        }
                      </span>

                      <h2>
                        {
                          report.title
                        }
                      </h2>
                    </div>

                    <span
                      className={`admin-severity admin-severity-${report.severity.toLowerCase()}`}
                    >
                      {
                        report.severity
                      }
                    </span>
                  </div>

                  <div className="admin-report-meta">
                    <span>
                      <ShieldAlert
                        size={15}
                      />

                      {report.type.replaceAll(
                        "_",
                        " "
                      )}
                    </span>

                    <span>
                      <MapPin
                        size={15}
                      />

                      {report.latitude.toFixed(
                        5
                      )}
                      ,{" "}
                      {report.longitude.toFixed(
                        5
                      )}
                    </span>
                  </div>

                  <p className="admin-report-description">
                    {
                      report.description
                    }
                  </p>

                  <div className="admin-report-date">
                    Submitted:{" "}
                    {new Date(
                      report.createdAt
                    ).toLocaleString()}
                  </div>

                  <div className="admin-review-controls">
                    <div className="confidence-control">
                      <label
                        htmlFor={`confidence-${report.id}`}
                      >
                        Confidence
                      </label>

                      <div>
                        <input
                          id={`confidence-${report.id}`}
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          disabled={
                            isProcessing
                          }
                          value={
                            confidence[
                              report.id
                            ] ?? 80
                          }
                          onChange={(
                            event
                          ) => {
                            const value =
                              Number(
                                event
                                  .target
                                  .value
                              );

                            setConfidence(
                              (
                                current
                              ) => ({
                                ...current,

                                [report.id]:
                                  value,
                              })
                            );
                          }}
                        />

                        <span>
                          %
                        </span>
                      </div>
                    </div>

                    <div className="admin-report-actions">
                      <button
                        type="button"
                        className="admin-reject-button"
                        disabled={
                          isProcessing
                        }
                        onClick={() =>
                          void handleReject(
                            report.id
                          )
                        }
                      >
                        <XCircle
                          size={17}
                        />

                        {isProcessing
                          ? "Processing..."
                          : "Reject"}
                      </button>

                      <button
                        type="button"
                        className="admin-verify-button"
                        disabled={
                          isProcessing
                        }
                        onClick={() =>
                          void handleVerify(
                            report.id
                          )
                        }
                      >
                        <CheckCircle2
                          size={17}
                        />

                        {isProcessing
                          ? "Processing..."
                          : "Verify"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}