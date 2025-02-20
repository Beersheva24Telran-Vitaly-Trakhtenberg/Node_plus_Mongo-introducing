import { connectToMongoDB, closeMongoDB, getCollection } from './DbHelper.js';

let accounts;
let courses;

async function main() {
    const courseObjects = {
        J101: { id: "J101", name: "Front-End", lecturer: "Vasya", hours: 200 },
        J102: { id: "J102", name: "JAVA", lecturer: "Vasya", hours: 300 },
        J103: { id: "J103", name: "Back-End", lecturer: "Olya", hours: 350 },
        J104: { id: "J104", name: "Node", lecturer: "Olya", hours: 150 },
        J105: { id: "J105", name: "AWS", lecturer: "Vova", hours: 200 },
        J106: { id: "J106", name: "C++", lecturer: "Vova", hours: 500 },
    };

    try {
        await connectToMongoDB();

        accounts = getCollection('accounts');
        courses = getCollection('courses');

        function toDbCourse(course) {
            const { name, lecturer, hours, id } = course;
            return { _id: id, name, lecturer, hours };
        }

        const insertAccount = async () => {
            await accounts.insertOne({ name: "Vitaly", password: "123" });
        }

        const insertCourse = async () => {
            await courses.insertOne({ courseName: "Java", instructor: "Vasya" });
        }

        async function insertCourses() {
            try {
                for  (const course of Object.values(courseObjects)) {
                    await courses.insertOne(toDbCourse(course));
                }
                console.log("All courses inserted");
            } catch (error) {
                console.log(error);
            }
        }


        await Promise.all([insertAccount(), insertCourse(), insertCourses()]);
        console.log("Course(-s) and account(-s) have been added");

        const allCourses = await courses.find({}).toArray();
        console.log(allCourses);

        await findCourse("J11").then((course) => console.log(course)).catch(e => console.log(e.message));
        await findFilteredCourses({lecturer: "Vasya", hours:200}).then((course) => console.log(course)).catch(e => console.log(e.message));
        await updateCourse("J101", {hours: 400});
        await deleteCourse("J001").then(res => console.log(res)).catch(e => console.log(e.message))
    } catch (error) {
        console.error("Error during database operations:", error);
    } finally {
        await closeMongoDB();
    }
}

async function findCourse(courseId) {
    const course = await courses.findOne({_id:courseId})
    if(!course) {
        throw Error(`course ${courseId} not found`);
    }
    return course;
}

async function findFilteredCourses(filter) {
    return await courses.find(filter).toArray()
}

async function updateCourse(courseId, updaterObj) {
    try {
        const result = await courses.updateOne(
            { _id: courseId },
            { $set: updaterObj }
        );
        if (result.matchedCount > 0) {
            console.log(`Course ${ courseId } updated`);
        } else {
            console.log(`Course ${ courseId } not found`);
        }
    } catch (err) {
        console.error("Error updating data:", err);
    }
    return await courses.findOneAndUpdate({_id: courseId}, {$set: updaterObj}, {returnDocument: "after"});
}

async function deleteCourse(courseId) {
    const res = await courses.findOneAndDelete({_id:courseId});
    if(!res) {
        throw Error(`course ${courseId} not found`)
    }
    return res;
}

main();
