import {
  ReportStatus,
} from "../../generated/prisma/enums";

import {
  prisma,
} from "../config/database";

export class AdminReportError
  extends Error {
  statusCode: number;

  constructor(
    statusCode: number,
    message: string
  ) {
    super(message);

    this.name =
      "AdminReportError";

    this.statusCode =
      statusCode;
  }
}

export async function getPendingReports() {
  return prisma.hazardReport.findMany({
    where: {
      status:
        ReportStatus.PENDING,
    },

    orderBy: {
      createdAt:
        "desc",
    },
  });
}

export async function verifyReport(
  reportId: number,
  adminId: number,
  confidence: number
) {
  return prisma.$transaction(
    async (transaction) => {
      const report =
        await transaction
          .hazardReport
          .findUnique({
            where: {
              id:
                reportId,
            },
          });

      if (!report) {
        throw new AdminReportError(
          404,
          "Hazard report not found."
        );
      }

      if (
        report.status !==
        ReportStatus.PENDING
      ) {
        throw new AdminReportError(
          409,
          "This report has already been reviewed."
        );
      }

      const hazard =
        await transaction
          .hazard
          .create({
            data: {
              type:
                report.type,

              severity:
                report.severity,

              title:
                report.title,

              description:
                report.description,

              latitude:
                report.latitude,

              longitude:
                report.longitude,

              confidence,

              verified:
                true,

              active:
                true,

              source:
                "community",

              reportId:
                report.id,
            },
          });

      const updatedReport =
        await transaction
          .hazardReport
          .update({
            where: {
              id:
                report.id,
            },

            data: {
              status:
                ReportStatus.VERIFIED,

              confidence,

              reviewedAt:
                new Date(),

              reviewedById:
                adminId,
            },
          });

      return {
        report:
          updatedReport,

        hazard,
      };
    }
  );
}

export async function rejectReport(
  reportId: number,
  adminId: number
) {
  return prisma.$transaction(
    async (transaction) => {
      const report =
        await transaction
          .hazardReport
          .findUnique({
            where: {
              id:
                reportId,
            },
          });

      if (!report) {
        throw new AdminReportError(
          404,
          "Hazard report not found."
        );
      }

      if (
        report.status !==
        ReportStatus.PENDING
      ) {
        throw new AdminReportError(
          409,
          "This report has already been reviewed."
        );
      }

      return transaction
        .hazardReport
        .update({
          where: {
            id:
              report.id,
          },

          data: {
            status:
              ReportStatus.REJECTED,

            confidence:
              0,

            reviewedAt:
              new Date(),

            reviewedById:
              adminId,
          },
        });
    }
  );
}