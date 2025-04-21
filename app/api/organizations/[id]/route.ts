import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

interface Params {
  id: string;
}

export async function GET(request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
  try {
  
      const { id } = await params
    
    if (!id) {
      return new NextResponse("Organization id is required", { status: 400 });
    }
    const organization = await prisma.organization.findUnique({
      where: {
        id: id,
      },
      include: {
        departments: {
          select: {
            department: {
              select: {
                label: true,
                icon : true,
                id : true
              },
            },
          },
        },
        services : {
            select : {
                name : true,
                id : true,
                image : true,
                description : true,
                departmentId : true,
                durationMax : true ,
                durationMin : true ,
                price : true
            }
        },
        OrganizationAvailability: {
          select: {
            openingTime: true,
            closingTime: true,
            mondayOpen : true,
            thursdayOpen : true,
            wednesdayOpen : true,
            fridayOpen : true,
            sundayOpen : true,
            saturdayOpen : true,
            tuesdayOpen : true
          },
        },
      },
    });

    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }
    const formatedOrganization = {
      ...organization,
      departments: organization.departments.map(
        (department) => department.department
      ),
    };

    return NextResponse.json(formatedOrganization);
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  }
}
