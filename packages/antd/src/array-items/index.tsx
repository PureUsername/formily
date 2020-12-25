import React, { createContext, useContext } from 'react'
import { Button } from 'antd'
import {
  MinusCircleOutlined,
  DownCircleOutlined,
  UpCircleOutlined,
  PlusOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon'
import { ButtonProps } from 'antd/lib/button'
import { useField, observer } from '@formily/react'
import { useSchema, RecursionField } from '@formily/react-schema-field'
import cls from 'classnames'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc'
import { ISchema } from '@formily/json-schema'
import './style.less'
interface IArrayItemsAdditionProps extends ButtonProps {
  title?: string
  method?: 'push' | 'unshift'
}

type ComposedArrayItems = React.FC & {
  SortHandle?: React.FC<AntdIconProps>
  Addition?: React.FC<IArrayItemsAdditionProps>
  Index?: React.FC
  Remove?: React.FC<AntdIconProps>
  MoveUp?: React.FC<AntdIconProps>
  MoveDown?: React.FC<AntdIconProps>
  useArrayItems?: () => Formily.Core.Models.ArrayField
  useArrayItemsIndex?: () => number
}

const SortableItem = SortableElement(
  (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => {
    return (
      <div {...props} className={cls('ant-array-items-item', props.className)}>
        {props.children}
      </div>
    )
  }
)

const SortableList = SortableContainer(
  (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props} className={cls('ant-array-items-list', props.className)}>
      {props.children}
    </div>
  )
)

const ArrayContext = createContext<Formily.Core.Models.ArrayField>(null)

const ArrayIndexContext = createContext<number>(null)

const isAdditionComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const useAddition = () => {
  const schema = useSchema()
  return schema.reduceProperties((addition, schema) => {
    if (isAdditionComponent(schema)) {
      return <RecursionField schema={schema} name="addition" />
    }
    return addition
  }, null)
}

export const ArrayItems: ComposedArrayItems = observer((props) => {
  const field = useField<Formily.Core.Models.ArrayField>()
  const schema = useSchema()
  const addition = useAddition()
  const dataSource = Array.isArray(field.value) ? [...field.value] : []
  return (
    <ArrayContext.Provider value={field}>
      <SortableList
        useDragHandle
        lockAxis="y"
        helperClass="ant-array-items-dragging"
        onSortEnd={({ oldIndex, newIndex }) => {
          field.move(oldIndex, newIndex)
        }}
      >
        {dataSource?.map((item, index) => {
          const items = Array.isArray(schema.items)
            ? schema.items[index] || schema.items[0]
            : schema.items
          return (
            <ArrayIndexContext.Provider key={index} value={index}>
              <SortableItem key={`item-${index}`} index={index}>
                <div className="ant-array-items-item-inner">
                  <RecursionField schema={items} name={index} />
                </div>
              </SortableItem>
            </ArrayIndexContext.Provider>
          )
        })}
      </SortableList>
      {addition}
    </ArrayContext.Provider>
  )
})

ArrayItems.displayName = 'ArrayItems'

ArrayItems.useArrayItems = () => useContext(ArrayContext)

ArrayItems.useArrayItemsIndex = () => useContext(ArrayIndexContext)

ArrayItems.SortHandle = SortableHandle((props: any) => {
  return (
    <MenuOutlined
      {...props}
      className={cls('ant-array-items-sort-handler', props.className)}
      style={{ ...props.style }}
    />
  )
}) as any

ArrayItems.Index = (props) => {
  const index = ArrayItems.useArrayItemsIndex()
  return <span>#{index + 1}.</span>
}

ArrayItems.Addition = (props) => {
  const self = useField()
  const field = ArrayItems.useArrayItems()
  return (
    <Button
      type="dashed"
      block
      className={cls('ant-array-items-addition', props.className)}
      {...props}
      onClick={() => {
        if (props.method === 'unshift') {
          field.unshift(null)
        } else {
          field.push(null)
        }
      }}
      icon={<PlusOutlined />}
    >
      {self.title || props.title}
    </Button>
  )
}

ArrayItems.Remove = React.forwardRef((props, ref) => {
  const index = ArrayItems.useArrayItemsIndex()
  const field = ArrayItems.useArrayItems()
  return (
    <MinusCircleOutlined
      {...props}
      className={cls('ant-array-items-remove', props.className)}
      ref={ref}
      onClick={() => {
        field.remove(index)
      }}
    />
  )
})

ArrayItems.MoveDown = React.forwardRef((props, ref) => {
  const index = ArrayItems.useArrayItemsIndex()
  const field = ArrayItems.useArrayItems()
  return (
    <DownCircleOutlined
      {...props}
      className={cls('ant-array-items-move-down', props.className)}
      ref={ref}
      onClick={() => {
        field.moveDown(index)
      }}
    />
  )
})

ArrayItems.MoveUp = React.forwardRef((props, ref) => {
  const index = ArrayItems.useArrayItemsIndex()
  const field = ArrayItems.useArrayItems()
  return (
    <UpCircleOutlined
      {...props}
      className={cls('ant-array-items-move-up', props.className)}
      ref={ref}
      onClick={() => {
        field.moveUp(index)
      }}
    />
  )
})

export default ArrayItems