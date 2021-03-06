import { Vector3, SceneLoaderProgressEvent, AbstractMesh, Mesh } from "babylonjs"
import { LoadedModel } from "./Model"
import { FiberMeshPropsHandler, FiberAbstractMeshPropsHandler, FiberTransformNodePropsHandler, FiberNodePropsHandler } from "../generatedCode"
import BasePropsHandler from "../BasePropsHandler"
import { UpdatePayload, PropsHandler, PropertyUpdate } from "../PropsHandler"

export type ModelProps = {
  meshNames?: any
  receiveShadows?: boolean
  rootUrl: string
  sceneFilename: string
  pluginExtension?: string // currently not used
  position?: Vector3
  scaling?: Vector3
  rotation?: Vector3
  showBoundingBox?: boolean

  /**
   * Only used on init.  Will not update dynamically (scaling will update dynamically and override this)
   */
  scaleToDimension?: number
  onModelLoaded?: (model: LoadedModel) => void
  onModelError?: (model: LoadedModel) => void
  onLoadProgress?: (event: SceneLoaderProgressEvent) => void
  onCreated?: (rootMesh: AbstractMesh) => void
}

export class FiberModel extends BasePropsHandler<LoadedModel, ModelProps> {
  constructor() {
    super([new ModelPropsHandler()])
  }
}

export class ModelPropsHandler implements PropsHandler<LoadedModel, ModelProps> {
  getPropertyUpdates(hostInstance: LoadedModel, oldProps: ModelProps, newProps: ModelProps, scene: BABYLON.Scene): UpdatePayload {
    const propsHandlers: PropsHandler<any, any>[] = [
      new FiberMeshPropsHandler(),
      new FiberAbstractMeshPropsHandler(),
      new FiberTransformNodePropsHandler(),
      new FiberNodePropsHandler()
    ]

    let meshUpdates: PropertyUpdate[] = []
    propsHandlers.forEach(propHandler => {
      // NOTE: this is actually WRONG, because here we want to compare the props with the object.
      let handlerUpdates: PropertyUpdate[] | null = propHandler.getPropertyUpdates(hostInstance.rootMesh as Mesh, oldProps, newProps, scene)
      if (handlerUpdates !== null) {
        meshUpdates.push(...handlerUpdates)
      }
    })

    if (meshUpdates.length === 0) {
      return null
    }

    // add target
    meshUpdates.forEach(propertyUpdate => (propertyUpdate.target = "rootMesh"))
    return meshUpdates
  }
}
