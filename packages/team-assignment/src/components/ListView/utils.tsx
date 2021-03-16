import React from 'react';
import { get, keyBy } from 'lodash';
import { Spin, Button } from 'antd';
import moment from 'moment';
import { Assignment } from '../../ducks/assignments';
import { ColumnsType, ColumnType } from 'antd/lib/table/interface';
import { ACTIONS, ASSIGN_TEAMS, NAME, EDIT, TableColumnsNamespace } from '../../lang';
import { TableData } from '.';
import { AssignLocationsAndPlans } from 'team-assignment/src/ducks/assignments/types';

/** component rendered in the action column of the table
 *
 * @param record - table row record
 */
export const ActionsColumnCustomRender: ColumnType<TableData>['render'] = (record) => {
  return (
    <>
      <Button
        type="link"
        style={{ padding: '4px 0px' }}
        onClick={() => {
          record.setModalVisibility(true);
          record.setExistingAssignments(record.existingAssignments);
          record.setAssignedLocAndTeams({
            locationName: record.locationName,
            jurisdictionId: record.id,
            assignedTeams: record.assignedTeamIds,
          });
        }}
      >
        {EDIT}
      </Button>
    </>
  );
};

/** team assignment table columns */
export const columns: ColumnsType<TableData> = [
  {
    title: NAME,
    dataIndex: 'locationName',
    key: `${TableColumnsNamespace}-locationName`,
    defaultSortOrder: 'descend',
    sorter: (rec1, rec2) => {
      if (rec1.locationName > rec2.locationName) {
        return -1;
      } else if (rec1.locationName < rec2.locationName) {
        return 1;
      } else {
        return 0;
      }
    },
  },
  {
    title: ASSIGN_TEAMS,
    dataIndex: 'assignedTeams',
    key: `${TableColumnsNamespace}-assignedTeams`,
  },
  {
    title: ACTIONS,
    key: `${TableColumnsNamespace}-actions`,
    render: ActionsColumnCustomRender,
    width: '20%',
  },
];

/** util component shown when there is a pending promise */

export const TeamAssignmentLoading = () => {
  return <Spin size="large" />;
};

/**
 * Get assignments payload
 *
 * Takes values from the team assignment edit form and generates a payload
 * of assignments ready to be sent to the OpenSRP API.
 *
 * @param {string[]} selectedOrgs - an array of the selected organization ids
 * @param {string} selectedPlanId - the selected plan definition object
 * @param {string} selectedJurisdictionId - the selected OpenSRP jurisdiction
 * @param {string[]} initialOrgs - an array of initial (existing) organization ids
 * @param {Assignment[]} existingAssignments - an array of Assignment objects that exist for this plan/jurisdiction
 * @returns {Assignment[]} - returns payload array to be POSTed
 */
export const getPayload = (
  selectedOrgs: string[],
  selectedPlanId: string,
  selectedJurisdictionId: string,
  initialOrgs: string[] = [],
  existingAssignments: Assignment[] = []
): AssignLocationsAndPlans[] => {
  const now = moment(new Date());
  let startDate = now.format();

  const payload: AssignLocationsAndPlans[] = [];
  const assignmentsByOrgId = keyBy(existingAssignments, 'organizationId');

  for (const orgId of selectedOrgs) {
    if (!payload.map((obj) => obj.organization).includes(orgId)) {
      if (initialOrgs.includes(orgId)) {
        // we should not change the fromDate, ever (the API will reject it)
        const thisAssignment = get(assignmentsByOrgId, orgId);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (thisAssignment) {
          startDate = thisAssignment.fromDate;
        }
      }
      payload.push({
        fromDate: startDate,
        jurisdiction: selectedJurisdictionId,
        organization: orgId,
        plan: selectedPlanId,
        toDate: now.add(10, 'year').format(), // set a future date of 10 years
      });
    }
  }

  // turns out if you put it in the loop it keeps subtracting a day for every iteration
  const retireDate = now.format();

  for (const retiredOrgId of initialOrgs.filter((orgId) => !selectedOrgs.includes(orgId))) {
    if (!payload.map((obj) => obj.organization).includes(retiredOrgId)) {
      // we should not change the fromDate, ever (the API will reject it)
      const thisAssignment = get(assignmentsByOrgId, retiredOrgId);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (thisAssignment) {
        startDate = thisAssignment.fromDate;
      }
      payload.push({
        fromDate: startDate,
        jurisdiction: selectedJurisdictionId,
        organization: retiredOrgId,
        plan: selectedPlanId,
        toDate: retireDate,
      });
    }
  }
  return payload;
};