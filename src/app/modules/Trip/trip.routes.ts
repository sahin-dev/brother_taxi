import { Router } from "express";

const router = Router()
//create a trip
router.post ('/')
//read trips
router.get('/')
//read a trip
router.get('/:id')
//update a trip
router.put("/:id")
//delete a trip
router.delete('/:id')

export default router