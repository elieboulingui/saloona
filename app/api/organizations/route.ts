import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET(req: Request) {
  try {
    const organizations = await prisma.organization.findMany({
      where :{
        verificationStatus : "verified"
      },
      include: {
        departments: {
          select: {
            department: {
              select: {
                label: true,
                id: true,
              },
            },
          },
        },
        OrganizationAvailability: true,
      },
    });

    const formattedOrganizations = organizations.map((organization) => ({
      ...organization,
      departments: organization.departments.map(
        (department) => department.department
      ),
    }));

    // Log the formatted organizations for debugging
    formattedOrganizations.forEach((org, index) => {
      console.log(`Organization ${index + 1}:`, org);
    });

    return NextResponse.json(formattedOrganizations);
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  }
}
