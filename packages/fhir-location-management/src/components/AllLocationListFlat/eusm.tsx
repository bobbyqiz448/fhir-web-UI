import React from 'react';
import { useMls } from '../../mls';
import { Button, Divider, Dropdown } from 'antd';
import { useHistory, Link } from 'react-router-dom';
import { RbacCheck } from '@opensrp/rbac';
import { MenuProps } from 'antd';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import './index.css';
import { BaseAllLocationListFlat, BaseAllLocationListFlatProps } from './base';
import { Dictionary } from '@onaio/utils';
import { eusmPhysicalLocationsFilterParams } from './utils';

export type EusmLocationListFlatProps = Omit<
  BaseAllLocationListFlatProps,
  'columns' | 'addLocationBtnRender' | 'pageTitle' | 'extraParamFilters'
>;

/* Function which shows the list of all locations
 *
 * @param {Object} props - AllLocationListFlat component props
 * @returns {Function} returns paginated locations list display
 */
export const EusmLocationListFlat: React.FC<EusmLocationListFlatProps> = (props) => {
  const { t } = useMls();
  const history = useHistory();

  const getItems = (_: Dictionary): MenuProps['items'] => {
    // Todo: replace _ above when handling onClick
    return [
      {
        key: '1',
        label: (
          <Button disabled type="link">
            {t('View details')}
          </Button>
        ),
      },
    ];
  };

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'name' as const,
      editable: true,
    },
    {
      title: t('Type'),
      dataIndex: 'type' as const,
      editable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status' as const,
      editable: true,
    },
    {
      title: t('Parent'),
      dataIndex: 'parent' as const,
      editable: true,
    },
    {
      title: t('Actions'),
      width: '10%',

      // eslint-disable-next-line react/display-name
      render: (_: unknown, record: Dictionary) => (
        <span className="d-flex align-items-center">
          <RbacCheck permissions={['Location.update']}>
            <>
              <Link to={`${'#'}/${record.id.toString()}`} className="m-0 p-1">
                {t('Edit')}
              </Link>
              <Divider type="vertical" />
            </>
          </RbacCheck>
          <Dropdown
            menu={{ items: getItems(record) }}
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <MoreOutlined className="more-options" data-testid="action-dropdown" />
          </Dropdown>
        </span>
      ),
    },
  ];

  const addLocationBtnRender = () => (
    <RbacCheck permissions={['Location.create']}>
      <Button disabled type="primary" onClick={() => history.push('#')}>
        <PlusOutlined />
        {t('Add Service point')}
      </Button>
    </RbacCheck>
  );

  const baseProps: BaseAllLocationListFlatProps = {
    ...props,
    pageTitle: t('Service points'),
    addLocationBtnRender,
    columns,
    extraParamFilters: eusmPhysicalLocationsFilterParams,
  };

  return <BaseAllLocationListFlat {...baseProps} />;
};